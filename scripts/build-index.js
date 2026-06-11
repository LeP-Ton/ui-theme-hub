/**
 * 主题索引生成脚本
 * 扫描仓库中所有含 theme.json 的目录，生成 docs/themes-index.json
 * 仅使用 Node.js 内置模块，无需 npm 依赖
 */
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(REPO_ROOT, 'docs');
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
const MD_EXT = '.md';

/* 确认 docs 目录存在 */
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

/* docs 内存放预览图片的目录 */
const PREVIEW_OUTPUT_DIR = path.join(DOCS_DIR, 'theme-previews');

/* 清理旧的预览图片目录，避免删除主题后残留图片 */
if (fs.existsSync(PREVIEW_OUTPUT_DIR)) {
  fs.rmSync(PREVIEW_OUTPUT_DIR, { recursive: true });
}
fs.mkdirSync(PREVIEW_OUTPUT_DIR, { recursive: true });

/* 扫描仓库根目录下所有含 theme.json 的子目录 */
const entries = fs.readdirSync(REPO_ROOT, { withFileTypes: true });
const themes = [];

for (const entry of entries) {
  /* 跳过非目录、隐藏目录、docs 和 scripts */
  if (!entry.isDirectory()) continue;
  if (entry.name.startsWith('.')) continue;
  if (entry.name === 'docs' || entry.name === 'scripts') continue;

  const themeJsonPath = path.join(REPO_ROOT, entry.name, 'theme.json');
  if (!fs.existsSync(themeJsonPath)) continue;

  /* 读取 theme.json 元数据 */
  const themeData = JSON.parse(fs.readFileSync(themeJsonPath, 'utf-8'));

  /* 扫描 previews/ 目录中的预览图片 */
  const previewDir = path.join(REPO_ROOT, entry.name, 'previews');
  const previews = [];
  if (fs.existsSync(previewDir)) {
    /* 为每个主题创建独立子目录，避免文件名冲突 */
    const themeOutputDir = path.join(PREVIEW_OUTPUT_DIR, entry.name);
    fs.mkdirSync(themeOutputDir, { recursive: true });

    for (const file of fs.readdirSync(previewDir)) {
      const ext = path.extname(file).toLowerCase();
      if (IMAGE_EXTS.has(ext)) {
        /* 复制图片到 docs/theme-previews/{theme-name}/，使 GitHub Pages 可访问 */
        const srcFile = path.join(previewDir, file);
        const destFile = path.join(themeOutputDir, file);
        fs.copyFileSync(srcFile, destFile);
        /* 路径相对于 docs/，因为 GitHub Pages 从 docs/ 部署 */
        previews.push(`theme-previews/${entry.name}/${file}`);
      }
    }
  }

  /* 扫描 patterns/ 目录中的页面模板和组件 */
  const patterns = { pages: [], components: [] };
  const pagesDir = path.join(REPO_ROOT, entry.name, 'patterns', 'pages');
  const componentsDir = path.join(REPO_ROOT, entry.name, 'patterns', 'components');

  if (fs.existsSync(pagesDir)) {
    for (const file of fs.readdirSync(pagesDir).sort()) {
      if (path.extname(file).toLowerCase() === MD_EXT) {
        const name = path.basename(file, MD_EXT);
        const content = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
        patterns.pages.push({ name, file, content });
      }
    }
  }

  if (fs.existsSync(componentsDir)) {
    for (const file of fs.readdirSync(componentsDir).sort()) {
      if (path.extname(file).toLowerCase() === MD_EXT) {
        const name = path.basename(file, MD_EXT);
        const content = fs.readFileSync(path.join(componentsDir, file), 'utf-8');
        patterns.components.push({ name, file, content });
      }
    }
  }

  themes.push({
    dir: entry.name,
    ...themeData,
    previews,
    patterns,
  });
}

/* 按名称排序 */
themes.sort((a, b) => a.name.localeCompare(b.name));

const output = {
  generatedAt: new Date().toISOString(),
  themes,
};

const outputPath = path.join(DOCS_DIR, 'themes-index.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + '\n');

console.log(`已生成索引：${themes.length} 个主题 → ${outputPath}`);
