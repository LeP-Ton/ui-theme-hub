/**
 * 主题索引生成脚本
 * 扫描仓库中所有含 theme.json 的目录，生成 docs/themes-index.json
 * 同时将 .tsx pattern 文件编译为独立 HTML 预览，输出到 docs/pattern-previews/
 *
 * CSS 处理策略：
 * - .tsx 中 import 的 CSS（如 import 'antd/dist/antd.min.css'）由 esbuild css loader 自动提取
 * - CSS-in-JS 库（antd 6、styled-components 等）的样式随 JS 打包，无需额外处理
 * - 所有 CSS 统一内联到 HTML <style>，生成单一可运行文件
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
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
 * 编译 tsx 为独立 HTML 预览文件
 * CSS 由 tsx 中的 import 驱动：import 'xxx.css' → esbuild 提取到 out.css → 内联到 HTML
 */
async function compileTsxToHtml(tsxFilePath) {
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
      /* CSS loader：将 import 'xxx.css' 提取到 out.css */
      loader: { '.css': 'css' },
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

/* ========== 主题源目录与配置 ========== */

/* 主题源目录：themes/ 下每个含 theme.json 的子目录即为一个主题 */
const THEMES_DIR = path.join(REPO_ROOT, 'themes');

/* 全局配置 */
const CONFIG_PATH = path.join(REPO_ROOT, 'theme.config.json');
const config = fs.existsSync(CONFIG_PATH)
  ? JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))
  : {};
const SCENE_LABELS = config.sceneLabels || {};

/* ========== 主题格式校验 ========== */

/**
 * 校验上下文：跨主题的唯一性检测集合
 * 每次校验通过后由调用方更新
 */
const validationContext = {
  seenDirs: new Set(),      /* dir 集合，检测目录名重复 */
  seenNames: new Map(),     /* name → dir，检测 name 重复 */
};

/**
 * 统一校验 theme.json 格式 + 唯一性
 * 所有校验逻辑集中在此函数，调用方只消费结果
 *
 * @param {object} themeData - theme.json 解析后的对象
 * @param {string} dirName   - 主题目录名
 * @returns {{ valid, errors, warnings }}
 *   - errors:   强校验失败，阻止入库
 *   - warnings: 弱校验问题，允许入库但提示
 */
function validateTheme(themeData, dirName) {
  const errors = [];
  const warnings = [];

  /* ===== 强校验：必填字段 ===== */
  const requiredFields = ['name', 'version', 'description', 'author', 'scene', 'tags'];
  for (const field of requiredFields) {
    if (themeData[field] == null) {
      errors.push(`缺少必填字段: ${field}`);
    }
  }

  /* ===== 强校验：字段类型 ===== */
  if (themeData.name != null && typeof themeData.name !== 'string') {
    errors.push('name 必须为字符串');
  }
  if (themeData.version != null && typeof themeData.version !== 'string') {
    errors.push('version 必须为字符串');
  }
  if (themeData.scene != null && typeof themeData.scene !== 'string') {
    errors.push('scene 必须为字符串');
  }
  if (themeData.tags != null && !Array.isArray(themeData.tags)) {
    errors.push('tags 必须为数组');
  }
  if (themeData.requires != null && !Array.isArray(themeData.requires)) {
    errors.push('requires 必须为数组');
  }

  /* ===== 强校验：唯一性 ===== */
  if (validationContext.seenDirs.has(dirName)) {
    errors.push(`目录名重复: ${dirName}`);
  }
  if (themeData.name && typeof themeData.name === 'string') {
    if (validationContext.seenNames.has(themeData.name)) {
      errors.push(`name 重复: "${themeData.name}" 与 ${validationContext.seenNames.get(themeData.name)} 冲突`);
    }
  }

  /* ===== 弱校验：已废弃字段 ===== */
  if ('id' in themeData) {
    warnings.push('id 字段已废弃，主题标识统一使用目录名（dir），请删除 id 字段');
  }

  /* ===== 弱校验：tokens 结构建议 ===== */
  if (!themeData.tokens) {
    warnings.push('缺少 tokens，详情页将无设计令牌展示');
  } else {
    if (!themeData.tokens.color) warnings.push('缺少 tokens.color，列表页色彩 fallback 将使用默认值');
    if (!themeData.tokens.spacing) warnings.push('缺少 tokens.spacing');
    if (!themeData.tokens.typography) warnings.push('缺少 tokens.typography');
  }

  /* ===== 弱校验：patterns 目录 ===== */
  const patternsDir = path.join(THEMES_DIR, dirName, 'patterns');
  if (!fs.existsSync(patternsDir)) {
    warnings.push('缺少 patterns 目录，该主题将无任何模式预览');
  } else {
    const pagesDir = path.join(patternsDir, 'pages');
    if (!fs.existsSync(pagesDir) || fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx')).length === 0) {
      warnings.push('patterns/pages 下无 .tsx 文件，建议至少提供 1 个页面模板');
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/* ========== 主流程 ========== */
const entries = fs.readdirSync(THEMES_DIR, { withFileTypes: true });
const themes = [];

async function main() {
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.')) continue;

    const themeJsonPath = path.join(THEMES_DIR, entry.name, 'theme.json');
    if (!fs.existsSync(themeJsonPath)) continue;

    const themeData = JSON.parse(fs.readFileSync(themeJsonPath, 'utf-8'));

    /* 统一校验：格式 + 唯一性 */
    const validation = validateTheme(themeData, entry.name);
    if (validation.errors.length > 0) {
      console.error(`\n🚫 主题 ${entry.name} 校验失败:`);
      validation.errors.forEach(e => console.error(`   ✗ ${e}`));
      continue;
    }
    if (validation.warnings.length > 0) {
      console.warn(`\n⚠️  主题 ${entry.name} 存在警告:`);
      validation.warnings.forEach(w => console.warn(`   ⚠ ${w}`));
    }

    /* 校验通过，更新唯一性上下文 */
    validationContext.seenDirs.add(entry.name);
    if (themeData.name) {
      validationContext.seenNames.set(themeData.name, entry.name);
    }

    console.log(`\n📦 处理主题: ${themeData.name}`);

    /* 扫描预览图片 */
    const previewDir = path.join(THEMES_DIR, entry.name, 'previews');
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
      { key: 'pages', dir: path.join(THEMES_DIR, entry.name, 'patterns', 'pages') },
      { key: 'components', dir: path.join(THEMES_DIR, entry.name, 'patterns', 'components') },
    ];

    for (const { key, dir } of patternDirs) {
      if (!fs.existsSync(dir)) continue;

      for (const file of fs.readdirSync(dir).sort()) {
        if (path.extname(file).toLowerCase() !== TSX_EXT) continue;

        const name = path.basename(file, TSX_EXT);
        const tsxPath = path.join(dir, file);
        const sourceCode = fs.readFileSync(tsxPath, 'utf-8');

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

  /* ========== 生成 themes-summary.json（轻量索引，供列表页和 AI 场景识别） ========== */
  const summary = themes.map(t => ({
    dir: t.dir,
    name: t.name,
    version: t.version,
    description: t.description,
    author: t.author,
    scene: t.scene,
    tags: t.tags,
    requires: t.requires,
    previews: t.previews,
    /* 列表页需要主色信息渲染 fallback 预览 */
    primaryColor: t.tokens?.color?.primary || '#6366f1',
    secondaryColor: t.tokens?.color?.secondary || '#818cf8',
    accentColor: t.tokens?.color?.accent || '#a78bfa',
    /* 列表页需要 pattern 名称列表 */
    patternPages: (t.patterns?.pages || []).map(p => p.name),
    patternComponents: (t.patterns?.components || []).map(p => p.name),
  }));

  /* 检测未映射的 scene 值，输出警告 */
  const allScenes = [...new Set(themes.map(t => t.scene))];
  for (const scene of allScenes) {
    if (!SCENE_LABELS[scene]) {
      console.warn(`⚠️  scene "${scene}" 未在 SCENE_LABELS 中配置中文映射，前端将显示原始值`);
    }
  }

  const summaryOutput = {
    generatedAt: new Date().toISOString(),
    sceneLabels: SCENE_LABELS,
    themes: summary,
  };
  const summaryPath = path.join(DOCS_DIR, 'themes-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summaryOutput, null, 2) + '\n');

  /* ========== 生成各主题 detail.json（单主题全量数据，供详情页按需加载） ========== */
  const DETAILS_DIR = path.join(DOCS_DIR, 'themes');
  if (fs.existsSync(DETAILS_DIR)) fs.rmSync(DETAILS_DIR, { recursive: true });
  fs.mkdirSync(DETAILS_DIR, { recursive: true });

  for (const theme of themes) {
    const themeId = theme.dir;
    const detailPath = path.join(DETAILS_DIR, `${themeId}.json`);
    fs.writeFileSync(detailPath, JSON.stringify(theme, null, 2) + '\n');
  }

  let totalPatterns = 0;
  themes.forEach(t => {
    totalPatterns += (t.patterns.pages?.length || 0) + (t.patterns.components?.length || 0);
  });
  console.log(`\n✅ 已生成索引：${themes.length} 个主题，${totalPatterns} 个 Pattern 预览`);
  console.log(`   轻量索引: ${summaryPath}`);
  console.log(`   详情索引: ${DETAILS_DIR}/`);

  /* ========== 生成主题安装包 ========== */
  const PACKAGES_DIR = path.join(DOCS_DIR, 'packages');
  if (fs.existsSync(PACKAGES_DIR)) fs.rmSync(PACKAGES_DIR, { recursive: true });
  fs.mkdirSync(PACKAGES_DIR, { recursive: true });

  for (const theme of themes) {
    const themeId = theme.dir;
    const themeDir = path.join(THEMES_DIR, theme.dir);
    const tmpDir = path.join(REPO_ROOT, '.tmp-package', themeId);

    /* 准备临时打包目录：仅主题目录，用户自行放置 */
    fs.mkdirSync(tmpDir, { recursive: true });
    const pkgThemeDir = path.join(tmpDir, themeId);
    fs.mkdirSync(pkgThemeDir, { recursive: true });

    /* 复制主题目录（排除 previews，下载后不需要） */
    for (const entry of fs.readdirSync(themeDir, { withFileTypes: true })) {
      if (entry.name === 'previews') continue;
      const src = path.join(themeDir, entry.name);
      const dest = path.join(pkgThemeDir, entry.name);
      if (entry.isDirectory()) {
        fs.cpSync(src, dest, { recursive: true });
      } else {
        fs.copyFileSync(src, dest);
      }
    }

    /* 打 zip 包 */
    const zipPath = path.join(PACKAGES_DIR, `${themeId}.zip`);
    try {
      execSync(`cd "${tmpDir}" && zip -r -q "${zipPath}" .`, { stdio: 'pipe' });
      const size = (fs.statSync(zipPath).size / 1024).toFixed(0);
      console.log(`  📦 ${themeId}.zip (${size} KB)`);
    } catch (err) {
      console.error(`  ✗ 打包 ${themeId} 失败:`, err.message);
    }

    /* 清理临时目录 */
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  console.log(`\n✅ 已生成 ${themes.length} 个主题包 → ${PACKAGES_DIR}`);
}

main().catch(err => {
  console.error('构建失败:', err);
  process.exit(1);
});
