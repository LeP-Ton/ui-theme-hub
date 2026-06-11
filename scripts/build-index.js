/**
 * 主题索引生成脚本
 * 扫描仓库中所有含 theme.json 的目录，生成 docs/themes-index.json
 * 同时将 .tsx pattern 文件编译为独立 HTML 预览，输出到 docs/pattern-previews/
 * React/ReactDOM 被完整打包进每个 HTML，确保独立可运行
 */
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const REPO_ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(REPO_ROOT, 'docs');
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
const TSX_EXT = '.tsx';

/* 确认 docs 目录存在 */
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

const PREVIEW_OUTPUT_DIR = path.join(DOCS_DIR, 'theme-previews');
const PATTERN_PREVIEW_DIR = path.join(DOCS_DIR, 'pattern-previews');

/* 清理旧目录 */
for (const dir of [PREVIEW_OUTPUT_DIR, PATTERN_PREVIEW_DIR]) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true });
  fs.mkdirSync(dir, { recursive: true });
}

/* 渲染入口代码：自动找到默认导出并渲染到 #root */
const VIRTUAL_ENTRY = 'virtual-entry.jsx';

/**
 * 编译 tsx 为独立 HTML 预览文件
 * 策略：通过 esbuild 插件将 tsx 文件作为虚拟入口，import 组件默认导出并渲染
 */
async function compileTsxToHtml(tsxFilePath) {
  /* 创建临时入口文件，import 组件并渲染 */
  const tmpDir = path.join(REPO_ROOT, '.tmp-build');
  fs.mkdirSync(tmpDir, { recursive: true });

  /* 将原始 tsx 复制到临时目录（确保 esbuild 能解析同目录依赖） */
  const tsxContent = fs.readFileSync(tsxFilePath, 'utf-8');
  const tmpComponent = path.join(tmpDir, 'component.tsx');
  fs.writeFileSync(tmpComponent, tsxContent);

  /* 生成入口文件 */
  const tmpEntry = path.join(tmpDir, 'entry.tsx');
  fs.writeFileSync(tmpEntry, `
import React from 'react';
import ReactDOM from 'react-dom/client';
import Pattern from './component';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(Pattern));
`);

  try {
    const outJs = path.join(tmpDir, 'out.js');
    const outCss = path.join(tmpDir, 'out.css');

    await esbuild.build({
      entryPoints: [tmpEntry],
      bundle: true,
      write: true,
      outfile: outJs,
      format: 'iife',
      target: ['es2020'],
      minify: true,
      define: {
        'process.env.NODE_ENV': '"production"',
      },
      logLevel: 'silent',
    });

    const jsCode = fs.existsSync(outJs) ? fs.readFileSync(outJs, 'utf-8') : '';
    const cssCode = fs.existsSync(outCss) ? fs.readFileSync(outCss, 'utf-8') : '';

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{overflow:auto}
${cssCode}
</style>
</head>
<body>
<div id="root"></div>
<script>${jsCode}</script>
</body>
</html>`;
    return html;
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

/* ========== 主流程 ========== */

const entries = fs.readdirSync(REPO_ROOT, { withFileTypes: true });
const themes = [];

async function main() {
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.')) continue;
    if (['docs', 'scripts', 'node_modules', '.tmp-build'].includes(entry.name)) continue;

    const themeJsonPath = path.join(REPO_ROOT, entry.name, 'theme.json');
    if (!fs.existsSync(themeJsonPath)) continue;

    const themeData = JSON.parse(fs.readFileSync(themeJsonPath, 'utf-8'));
    console.log(`\n📦 处理主题: ${themeData.name}`);

    /* 扫描预览图片 */
    const previewDir = path.join(REPO_ROOT, entry.name, 'previews');
    const previews = [];
    if (fs.existsSync(previewDir)) {
      const themeOutputDir = path.join(PREVIEW_OUTPUT_DIR, entry.name);
      fs.mkdirSync(themeOutputDir, { recursive: true });
      for (const file of fs.readdirSync(previewDir)) {
        const ext = path.extname(file).toLowerCase();
        if (IMAGE_EXTS.has(ext)) {
          fs.copyFileSync(
            path.join(previewDir, file),
            path.join(themeOutputDir, file)
          );
          previews.push(`theme-previews/${entry.name}/${file}`);
        }
      }
    }

    /* 扫描 patterns/ 目录中的 .tsx 文件 */
    const patterns = { pages: [], components: [] };
    const patternDirs = [
      { key: 'pages', dir: path.join(REPO_ROOT, entry.name, 'patterns', 'pages') },
      { key: 'components', dir: path.join(REPO_ROOT, entry.name, 'patterns', 'components') },
    ];

    for (const { key, dir } of patternDirs) {
      if (!fs.existsSync(dir)) continue;

      for (const file of fs.readdirSync(dir).sort()) {
        if (path.extname(file).toLowerCase() !== TSX_EXT) continue;

        const name = path.basename(file, TSX_EXT);
        const tsxPath = path.join(dir, file);
        const sourceCode = fs.readFileSync(tsxPath, 'utf-8');

        /* 编译预览 HTML */
        let previewPath = null;
        try {
          const html = await compileTsxToHtml(tsxPath);
          const outputDir = path.join(PATTERN_PREVIEW_DIR, entry.name, key);
          fs.mkdirSync(outputDir, { recursive: true });
          const outputPath = path.join(outputDir, `${name}.html`);
          fs.writeFileSync(outputPath, html);
          previewPath = `pattern-previews/${entry.name}/${key}/${name}.html`;
          console.log(`  ✓ ${key === 'pages' ? '页面' : '组件'}: ${name}`);
        } catch (err) {
          console.error(`  ✗ 编译 ${key}/${name}.tsx 失败:`, err.message);
        }

        patterns[key].push({
          name,
          file,
          source: sourceCode,
          preview: previewPath,
        });
      }
    }

    themes.push({
      dir: entry.name,
      ...themeData,
      previews,
      patterns,
    });
  }

  /* 排序输出 */
  themes.sort((a, b) => a.name.localeCompare(b.name));

  const output = {
    generatedAt: new Date().toISOString(),
    themes,
  };

  const outputPath = path.join(DOCS_DIR, 'themes-index.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + '\n');

  let totalPatterns = 0;
  themes.forEach(t => {
    totalPatterns += (t.patterns.pages?.length || 0) + (t.patterns.components?.length || 0);
  });
  console.log(`\n✅ 已生成索引：${themes.length} 个主题，${totalPatterns} 个 Pattern 预览`);
  console.log(`   输出: ${outputPath}`);
}

main().catch(err => {
  console.error('构建失败:', err);
  process.exit(1);
});
