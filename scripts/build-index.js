/**
 * 主题索引生成脚本
 * 扫描仓库中所有含 theme.json 的目录，生成 docs/themes-index.json
 * 同时将 .tsx pattern 文件编译为独立 HTML 预览，输出到 docs/pattern-previews/
 *
 * CSS 注入策略：
 * - theme.json requires 中声明 style 字段的依赖，其 CSS 会自动内联到 HTML <style>
 * - 无 style 字段（如 antd 6 CSS-in-JS、poem 等）则不做额外处理
 * - 支持同时混合 antd 4（需 CSS）和 antd 6（无需 CSS）
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

/**
 * 从 theme.json 的 requires 中收集需要内联的 CSS 文件内容
 *
 * requires 格式示例：
 *   { "name": "antd", "source": "...", "style": "antd/dist/antd.min.css" }
 *   — style 为相对于 node_modules 中该包的 CSS 路径
 *   — 不声明 style 的依赖（如 antd 6 CSS-in-JS）不会触发任何 CSS 注入
 */
function collectRequireStyles(requires) {
  const cssContents = [];

  if (!Array.isArray(requires)) return cssContents;

  for (const req of requires) {
    if (!req.style) continue; /* 无 style 声明，跳过（CSS-in-JS 库） */

    try {
      /* 从 node_modules 中解析 CSS 文件路径 */
      const cssPath = require.resolve(req.style, { paths: [REPO_ROOT] });
      const content = fs.readFileSync(cssPath, 'utf-8');
      cssContents.push(content);
      console.log(`    🎨 注入 CSS: ${req.style} (${(content.length / 1024).toFixed(0)}KB)`);
    } catch (err) {
      console.warn(`    ⚠️ CSS 文件未找到: ${req.style} (依赖 ${req.name})`);
    }
  }

  return cssContents;
}

/**
 * 编译 tsx 为独立 HTML 预览文件
 * @param {string} tsxFilePath - 组件 tsx 文件路径
 * @param {string[]} extraCss - 需要内联的额外 CSS 内容数组
 */
async function compileTsxToHtml(tsxFilePath, extraCss = []) {
  const tmpDir = path.join(REPO_ROOT, '.tmp-build');
  fs.mkdirSync(tmpDir, { recursive: true });

  /* 将原始 tsx 复制到临时目录 */
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
    /* esbuild 编译产出的 CSS（如有） */
    const bundledCss = fs.existsSync(outCss) ? fs.readFileSync(outCss, 'utf-8') : '';

    /* 拼装所有 CSS：重置样式 + esbuild 产出的 CSS + requires 声明的额外 CSS */
    const allExtraCss = [bundledCss, ...extraCss].filter(Boolean).join('\n');

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{overflow:auto}
${allExtraCss}
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

    /* 从 requires 收集需要内联的 CSS */
    const extraCss = collectRequireStyles(themeData.requires);

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

        /* 编译预览 HTML（注入主题依赖的 CSS） */
        let previewPath = null;
        try {
          const html = await compileTsxToHtml(tsxPath, extraCss);
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
