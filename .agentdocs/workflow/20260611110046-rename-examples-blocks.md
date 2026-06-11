# 主题目录命名优化：examples → preview，blocks → components

## 背景与目标
- `examples/` 命名不够语义化，该目录存放的是主题预览截图，`preview/` 更直观
- `patterns/blocks/` 中的 blocks 指的是可复用 UI 组件，`components/` 更符合前端习惯

## 约束与原则
- 所有引用旧目录名的文件需同步更新
- docs 内的缓存图片目录同步重命名（themes-examples → theme-previews）
- 索引 JSON 中字段名从 `examples` 改为 `previews`

## 阶段与 TODO
- [x] 重命名4个主题目录 examples/ → preview/
- [x] 重命名4个主题目录 patterns/blocks/ → patterns/components/
- [x] 更新 scripts/build-index.js（目录路径、变量名、输出字段名）
- [x] 更新 docs/app.js（theme.examples → theme.previews）
- [x] 更新 .github/workflows/pages.yml（路径匹配规则）
- [x] 更新 README.md（目录结构说明）
- [x] 重新生成 docs/themes-index.json

## 代码变更

### scripts/build-index.js
```diff
- const EXAMPLES_OUTPUT_DIR = path.join(DOCS_DIR, 'themes-examples');
+ const PREVIEW_OUTPUT_DIR = path.join(DOCS_DIR, 'theme-previews');

- /* 扫描 examples/ 目录中的图片文件 */
- const examplesDir = path.join(REPO_ROOT, entry.name, 'examples');
- const examples = [];
- if (fs.existsSync(examplesDir)) {
+ /* 扫描 preview/ 目录中的预览图片 */
+ const previewDir = path.join(REPO_ROOT, entry.name, 'preview');
+ const previews = [];
+ if (fs.existsSync(previewDir)) {

-   for (const file of fs.readdirSync(examplesDir)) {
+   for (const file of fs.readdirSync(previewDir)) {

-       const srcFile = path.join(examplesDir, file);
+       const srcFile = path.join(previewDir, file);

-       examples.push(`themes-examples/${entry.name}/${file}`);
+       previews.push(`theme-previews/${entry.name}/${file}`);

-     examples,
+     previews,
```

### docs/app.js
```diff
- const preview = theme.examples.length > 0
+ const preview = theme.previews.length > 0

- const scrollable = theme.examples.length > 1 ? ' scrollable' : '';
- const images = theme.examples.map(src =>
+ const scrollable = theme.previews.length > 1 ? ' scrollable' : '';
+ const images = theme.previews.map(src =>

- const indicator = theme.examples.length > 1
-   ? `<span class="scroll-indicator">${theme.examples.length} 张</span>`
+ const indicator = theme.previews.length > 1
+   ? `<span class="scroll-indicator">${theme.previews.length} 张</span>`
```

### .github/workflows/pages.yml
```diff
-       - '**/examples/**'
+       - '**/preview/**'
```

### README.md
```diff
- │   └── blocks/
+ │   └── components/

- └── examples/               # 可选：预览截图（.png/.webp）
+ └── preview/                # 可选：预览截图（.png/.webp）

- 3. 添加 patterns/、standards/、examples/ 等
+ 3. 添加 patterns/、standards/、preview/ 等
```

### 目录重命名
```diff
# 4个主题
- {theme}/examples/  →  {theme}/preview/
- {theme}/patterns/blocks/  →  {theme}/patterns/components/

# docs 内缓存目录
- docs/themes-examples/  →  docs/theme-previews/
```

## 测试用例
### TC-001 预览图正常显示
  - 类型：功能测试
  - 优先级：高
  - 操作步骤：刷新页面，查看 cyberpunk-theme 卡片
  - 预期结果：预览图正常显示，img src 指向 theme-previews/cyberpunk-theme/xxx.png

### TC-002 索引字段名正确
  - 类型：功能测试
  - 优先级：高
  - 操作步骤：检查 themes-index.json
  - 预期结果：每个主题使用 "previews" 字段而非 "examples"
