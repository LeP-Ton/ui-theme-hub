# CSS 注入改为 import 驱动：删除 requires.style 机制

## 背景与目标
- requires.style 方案需要在 theme.json 中重复声明 CSS 路径，与 tsx 中的 import 信息冗余
- esbuild 原生支持 CSS loader，tsx 中 `import 'antd/dist/antd.min.css'` 可自动提取到 out.css
- 构建 script 已有读取 out.css 拼进 HTML 的逻辑，只需加一行 `loader: { '.css': 'css' }`

## 约束与原则
- CSS 由 import 驱动，单一来源，不需要额外声明
- antd 4 → `import 'antd/dist/antd.min.css'`（esbuild 提取到 out.css → 内联 HTML）
- antd 6 / CSS-in-JS → 不 import CSS 文件，样式随 JS 打包
- theme.json requires 恢复为纯元数据（name + source），不再承担构建职责

## 当前进展
- ✅ 构建脚本删除 collectRequireStyles，加 CSS loader
- ✅ boss 主题 4 个 tsx 文件加 `import 'antd/dist/antd.min.css'`
- ✅ boss 主题 theme.json 移除 style 字段
- ✅ 构建验证通过，体积与之前一致

## 代码变更

### scripts/build-index.js
```diff
-  * CSS 注入策略：
-  * - theme.json requires 中声明 style 字段的依赖，其 CSS 会自动内联到 HTML <style>
-  * - 无 style 字段（如 antd 6 CSS-in-JS、poem 等）则不做额外处理
-  * - 支持同时混合 antd 4（需 CSS）和 antd 6（无需 CSS）
+  * CSS 处理策略：
+  * - .tsx 中 import 的 CSS 由 esbuild css loader 自动提取
+  * - CSS-in-JS 库的样式随 JS 打包，无需额外处理
+  * - 所有 CSS 统一内联到 HTML <style>

- function collectRequireStyles(requires) { ... }

- async function compileTsxToHtml(tsxFilePath, extraCss = []) {
+ async function compileTsxToHtml(tsxFilePath) {
     /* ... */
     await esbuild.build({
       /* ... */
+      loader: { '.css': 'css' },
     });

-    const allExtraCss = [bundledCss, ...extraCss].filter(Boolean).join('\n');
+    /* cssCode 已包含所有 import 引入的 CSS */

  /* 主流程 */
- const extraCss = collectRequireStyles(themeData.requires);
- const html = await compileTsxToHtml(tsxPath, extraCss);
+ const html = await compileTsxToHtml(tsxPath);
```

### boss-theme-blue/theme.json / boss-theme-orange/theme.json
```diff
  "requires": [
-   { "name": "antd", "source": "...", "style": "antd/dist/antd.min.css" }
+   { "name": "antd", "source": "..." }
  ]
```

### boss 主题 4 个 .tsx 文件
```diff
  import React from 'react';
+ import 'antd/dist/antd.min.css';
  import { ... } from 'antd';
```

## 测试用例
### TC-001 antd CSS 通过 import 自动内联
- 构建后 boss 主题 HTML 包含 antd 样式（grep ant-btn 命中）
- apple/cyberpunk 主题 HTML 不包含 antd 样式

### TC-002 无 CSS import 的组件不生成 out.css
- apple-theme 的 tsx 无 CSS import
- 构建后 out.css 不存在或为空，HTML 体积 ~140KB

### TC-003 混合场景（理论）
- 同一主题中组件 A 用 antd 4（import CSS），组件 B 用 antd 6（CSS-in-JS）
- 组件 A 的 HTML 含 antd CSS，组件 B 不含，互不影响
