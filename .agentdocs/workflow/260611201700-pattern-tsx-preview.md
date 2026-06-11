# Pattern 系统重构：.tsx 模板 + 预览/源码切换

## 背景与目标
- 将 patterns 从 markdown 描述改为 .tsx 格式，由注释负责解释
- 构建脚本负责将 .tsx 编译为独立可运行的 HTML 预览
- 详情页支持「预览」和「源码」模式切换

## 约束与原则
- .tsx 使用内联样式（React.CSSProperties），不依赖外部 CSS 文件
- 每个主题保留 1-2 个页面模板 + 1-2 个组件，精简实用
- 预览 HTML 自包含（React 打包在内），可独立运行
- esbuild 编译，无需 webpack/vite 等重型工具链

## 阶段与 TODO
- [x] 初始化 package.json + 安装 react/react-dom/esbuild
- [x] 为 4 个主题各编写 .tsx pattern 文件
- [x] 更新 build-index.js：.tsx 编译 → HTML 预览 + 源码嵌入 JSON
- [x] 更新 detail.js：预览/源码模式切换
- [x] 更新 detail.css：模式切换按钮 + iframe 预览样式
- [x] 构建验证通过

## 关键风险
- esbuild `write: false` 模式下 outputFiles 为空（已用 `write: true` + 读文件解决）
- esbuild alias 方案无法映射 .tsx（改用临时入口文件方案）
- React 18 UMD 不再通过 exports 暴露（改为全部打包进 bundle）

## 当前进展
- 8 个 Pattern（4 主题 × 1 页面 + 1 组件）全部编译成功
- themes-index.json 包含 source + preview 字段
- 详情页支持预览/源码模式切换

## 代码变更

### package.json（新增）
```diff
+ {
+   "name": "ui-theme-hub",
+   "version": "1.0.0",
+   "private": true,
+   "scripts": {
+     "build": "node scripts/build-index.js",
+     "preview": "npx http-server docs -p 3000 -c-1"
+   },
+   "devDependencies": {
+     "esbuild": "^0.20.0",
+     "react": "^18.3.1",
+     "react-dom": "^18.3.1",
+     "@types/react": "^18.3.3",
+     "@types/react-dom": "^18.3.0"
+   }
+ }
```

### scripts/build-index.js（重写）
```diff
- const MD_EXT = '.md';
+ const TSX_EXT = '.tsx';
- /* 扫描 patterns/ 目录中的页面模板和组件 */
- if (path.extname(file).toLowerCase() === MD_EXT) {
-   const name = path.basename(file, MD_EXT);
-   const content = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
-   patterns.pages.push({ name, file, content });
- }
+ /* 编译 .tsx 为独立 HTML 预览 */
+ async function compileTsxToHtml(tsxFilePath) { ... }
+ /* 读取源码 + 生成预览 */
+ const sourceCode = fs.readFileSync(tsxPath, 'utf-8');
+ const html = await compileTsxToHtml(tsxPath);
+ patterns.pages.push({ name, file, source: sourceCode, preview: previewPath });
```

### docs/detail.js（重写 Patterns 渲染）
```diff
- function renderPatternGroup(label, groupKey, items) {
-   const list = items.map((item, idx) => `
-     <div class="pattern-item">
-       <div class="pattern-item-header">
-         <span class="pattern-item-name">...</span>
-         <span class="pattern-item-toggle">展开</span>
-       </div>
-       <div class="pattern-item-content" style="display:none;">
-         <pre><code>${escapeHTML(item.content)}</code></pre>
-       </div>
-     </div>
-   `);
+ function renderPatternGroup(label, groupKey, items) {
+   /* 支持 preview/source 双模式 */
+   const hasPreview = !!item.preview;
+   const defaultMode = hasPreview ? 'preview' : 'source';
+   /* 模式切换按钮 */
+   <button class="mode-btn mode-btn-preview" data-mode="preview">预览</button>
+   <button class="mode-btn mode-btn-source" data-mode="source">源码</button>
+   /* iframe 预览 */
+   <iframe class="pattern-iframe" src="${item.preview}" loading="lazy"></iframe>
+   /* 源码展示 */
+   <pre><code>${escapeHTML(item.source)}</code></pre>
+ }
+ function bindPatternModeSwitch() { ... }
+ function adjustIframeHeight(container) { ... }
```

### docs/detail.css（新增 Pattern 模式切换样式）
```diff
+ .pattern-mode-switch { display: flex; gap: 2px; background: var(--bg); border-radius: 6px; padding: 2px; }
+ .mode-btn { ... }
+ .mode-btn.active { background: var(--card-bg); color: var(--accent); font-weight: 600; }
+ .pattern-preview-container { background: #ffffff; }
+ .pattern-iframe { width: 100%; min-height: 300px; height: 480px; border: none; }
+ .pattern-source-container { background: #1e1e2e; max-height: 600px; overflow: auto; }
```

### 新增 .tsx 文件
- `apple-theme/patterns/pages/landing-page.tsx` — Apple 风格落地页
- `apple-theme/patterns/components/feature-grid.tsx` — 特性网格组件
- `boss-theme-blue/patterns/pages/dashboard.tsx` — Boss 蓝色仪表盘
- `boss-theme-blue/patterns/components/stats-cards.tsx` — 统计卡片组件
- `boss-theme-orange/patterns/pages/list-page.tsx` — Boss 橙色列表页
- `boss-theme-orange/patterns/components/form-section.tsx` — 表单区块组件
- `cyberpunk-theme/patterns/pages/game-hud.tsx` — 赛博朋克游戏 HUD
- `cyberpunk-theme/patterns/components/character-panel.tsx` — 角色信息面板

### 删除旧文件
- `cyberpunk-theme/patterns/pages/game-hud.md`（已替换为 .tsx）

## 测试用例
### TC-001 预览模式正常渲染
- 类型：功能测试
- 优先级：高
- 前置条件：运行 `node scripts/build-index.js` 成功
- 操作步骤：
  1. 打开 `detail.html?theme=apple-theme`
  2. 展开 Patterns 区块
  3. 点击 landing-page 的「展开」
  4. 确认默认显示预览模式（iframe）
- 预期结果：iframe 内正确渲染落地页，包含导航栏、英雄区、特性卡片

### TC-002 源码模式显示 .tsx 代码
- 类型：功能测试
- 优先级：高
- 操作步骤：
  1. 展开 Pattern 后点击「源码」按钮
- 预期结果：显示原始 .tsx 源码，含注释和 TypeScript 类型定义

### TC-003 模式切换不触发折叠
- 类型：交互测试
- 优先级：中
- 操作步骤：
  1. 展开一个 Pattern
  2. 点击「源码」按钮
- 预期结果：模式从预览切换到源码，Pattern 不折叠

### TC-004 构建脚本编译所有 tsx
- 类型：构建测试
- 优先级：高
- 操作步骤：
  1. 运行 `node scripts/build-index.js`
  2. 检查 `docs/pattern-previews/` 目录
- 预期结果：4 个主题 × 2 pattern = 8 个 HTML 文件生成
