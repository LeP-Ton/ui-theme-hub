# 提炼 ai-ppt 项目为一个 PPT 主题

## 背景与目标
用户在 `/Users/didi/Documents/program/program/ai-ppt`（实际路径 `/Users/didi/Documents/program/ai-ppt`）维护着一个原生 HTML/CSS/JS 的 AI 分享演示稿项目，零依赖、内置 Markdown 编辑器、标题逐字动画。本次任务将其视觉风格与内容结构提炼为 ui-theme-hub 中的一个标准主题，使其可被列表页展示、详情页预览、打包下载。

## 约束与原则
- 遵循 ui-theme-hub 既有主题规范：themes/{dir}/ 下含 theme.json（中文 name + 必填字段 + tokens）、patterns/{pages,components}/*.tsx（内联样式 React 组件）、standards/*.md、previews/。
- theme.json 无 id 字段，name 全局唯一中文显示名，dir 为唯一标识。
- pattern 使用 React + 内联样式（CSSProperties），不引入第三方 CSS（本主题无 antd 等依赖）。
- tokens 从 ai-ppt 的 styles.css `:root` 变量原样提取，保持视觉一致性。
- 新增 scene 需在 theme.config.json 的 sceneLabels 补中文映射。

## 阶段与 TODO
- [x] 调研 ai-ppt 项目结构（index.html / styles.css / README / AGENTS.md）
- [x] 调研 ui-theme-hub 主题规范（apple-theme / cyberpunk-theme 为模板，build-index.js 校验逻辑）
- [x] 提取 ai-ppt 设计 tokens（暖橙 #ff6a3d + 天蓝 #0076ff + 浅蓝渐变 + 毛玻璃 + 光斑）
- [x] 创建 themes/ai-ppt-theme/ 目录结构
- [x] 编写 theme.json（scene=presentation，tags 含 warm/glassmorphism）
- [x] 编写页面 pattern：slide-deck.tsx（顶部元信息 + 光斑背景 + 舞台 + 进度栏）
- [x] 编写组件 pattern：dual-column-card.tsx（问题/方法双栏对照 + callout 条幅）
- [x] 编写 standards/presentation.md（演讲稿专属规范）
- [x] theme.config.json 新增 presentation → 演讲 场景映射
- [x] 运行 build-index.js 验证构建通过
- [x] 更新 AGENTS.md 主题表
- [x] git commit

## 关键风险
- ai-ppt 原项目依赖 poem 动画库做标题逐字动画；本主题 pattern 为静态预览，动画库仅在 requires 声明，运行时由使用方接入，预览不渲染动画（符合 ui-theme-hub pattern 为独立可运行 HTML 的定位）。
- 原 ai-ppt 背景光斑用 CSS keyframes 浮动；pattern 静态预览中保留光斑外观但不做 keyframes 动画（esbuild 编译为静态 HTML，无持续动画上下文需求）。
- scene=presentation 为新增场景，已在 theme.config.json 补映射，否则构建会输出"未映射"警告。

## 当前进展
完成。新主题「AI 演示稿」构建通过，5 个主题 10 个 Pattern 预览全部编译成功，无错误无警告。

## 代码变更（使用 git diff）

### 已修改文件

#### AGENTS.md（当前主题表新增一行）
```diff
 ## 当前主题
 | 目录名 (dir) | 显示名 (name) | 场景 | 主色 | Patterns |
 |--------------|---------------|------|------|----------|
+| ai-ppt-theme | AI 演示稿 | 演讲 | #ff6a3d (橙) | slide-deck, dual-column-card |
 | apple-theme | Apple 风格 | C端 | #fa8c16 (橙) | landing-page, feature-grid |
```

#### theme.config.json（新增 presentation 场景映射）
```diff
   "sceneLabels": {
     "c-end": "C端",
     "enterprise": "企业级",
-    "game": "游戏"
+    "game": "游戏",
+    "presentation": "演讲"
   }
```

### 新增文件
- `themes/ai-ppt-theme/theme.json` — 主题元数据 + 设计 tokens（color/spacing/typography/border/shadow/motion 全套，从 ai-ppt styles.css :root 提取；extended 含光斑色、渐变、calloutBg 等）
- `themes/ai-ppt-theme/patterns/pages/slide-deck.tsx` — 页面级 pattern，复刻 ai-ppt 单页结构：浮动光斑背景 + 顶部元信息栏 + 毛玻璃幻灯片舞台（页签/大标题/正文/三栏指标卡）+ 底部进度栏
- `themes/ai-ppt-theme/patterns/components/dual-column-card.tsx` — 组件级 pattern，复刻 ai-ppt 的 dual-column + card 对照结构（问题本质/我的方法双栏 + 关键词 callout 条幅）
- `themes/ai-ppt-theme/standards/presentation.md` — 演讲稿专属规范：设计基调、典型布局、视觉风格、内容块类型、交互规范、页面类型
- `themes/ai-ppt-theme/previews/` — 预览截图目录（预留，本次未放图）
- 构建产物（自动生成，已纳入 docs/）：`docs/themes/ai-ppt-theme.json`、`docs/pattern-previews/ai-ppt-theme/`、`docs/packages/ai-ppt-theme.zip`

## 测试用例

### 验证方法
1. **构建校验**：`node scripts/build-index.js`
   - 预期：输出 `📦 处理主题: AI 演示稿` + `✓ 页面: slide-deck` + `✓ 组件: dual-column-card`，无 ✗ / ⚠
   - 预期：末尾 `✅ 已生成索引：5 个主题，10 个 Pattern 预览`
2. **场景映射**：检查 `docs/themes-summary.json` 的 `sceneLabels` 含 `"presentation": "演讲"`
3. **详情数据**：检查 `docs/themes/ai-ppt-theme.json` 的 `primaryColor=#ff6a3d`、`patternPages=['slide-deck']`、`patternComponents=['dual-column-card']`
4. **预览渲染**：浏览器打开 `docs/pattern-previews/ai-ppt-theme/pages/slide-deck.html`
   - 预期：浅蓝渐变背景 + 三个浮动光斑（橙/蓝/黄）+ 毛玻璃白面板 + 橙色指标值 + 蓝色页签 + 底部蓝色渐变进度条
5. **列表页**：本地起 `python3 -m http.server` 访问 docs/index.html，按「演讲」场景筛选应见「AI 演示稿」卡片

### 实际结果（本次执行）
- 构建：✅ 5 主题 10 Pattern，ai-ppt-theme.zip 9 KB，无错误无警告
- 场景映射：✅ sceneLabels 含 presentation→演讲
- 详情数据：✅ primaryColor/secondaryColor/accentColor 与 pattern 列表均正确
- 预览 HTML：✅ slide-deck.html 148KB、dual-column-card.html 145KB（含 React bundle），已生成
