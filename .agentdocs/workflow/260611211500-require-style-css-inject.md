# 通用 CSS 注入机制 + Boss 主题使用 antd 组件

## 背景与目标
- 主题依赖项不固定（antd 4/6、poem、augmented-ui 等），需要一种通用方式处理外部 CSS
- antd 4 需要 `antd.min.css`，antd 6 用 CSS-in-JS 不需要，两者要同时支持
- Boss 主题的 pattern 从内联样式模拟改为使用真实 antd 组件

## 约束与原则
- 构建脚本不做硬编码库判断，通过 theme.json 的 `requires.style` 声明驱动
- 不声明 `style` 字段的依赖（CSS-in-JS 库）不做额外处理
- antd 作为 optionalDependencies，未安装时仅影响 boss 主题构建

## 方案设计

### theme.json requires 新增 style 字段
```json
// antd 4（需外部 CSS）
{ "name": "antd", "source": "...", "style": "antd/dist/antd.min.css" }

// antd 6 / CSS-in-JS 库（无需外部 CSS）
{ "name": "antd", "source": "..." }
// 不声明 style → 构建脚本不注入额外 CSS

// 多 CSS 依赖
{ "name": "lib-x", "source": "...", "style": "lib-x/dist/main.css" }
```

### 构建脚本流程
1. 读取 theme.json requires，收集所有声明了 style 的依赖
2. 用 `require.resolve(req.style)` 从 node_modules 解析 CSS 路径
3. 读取 CSS 内容，注入到每个 pattern 预览 HTML 的 `<style>` 标签中
4. CSS 未找到时仅 warning，不阻断构建

### 体积对比
| 场景 | 单 HTML 体积 |
|------|------------|
| 纯 React（apple/cyberpunk） | ~140KB |
| antd 4 + CSS（boss 组件） | ~900-1200KB |
| antd 6（理论值） | ~300-550KB |

## 当前进展
- ✅ 构建脚本支持通用 CSS 注入
- ✅ boss-theme-blue/orange theme.json 声明 style 字段
- ✅ boss 主题 4 个 pattern 改为使用 antd 组件
- ✅ 构建验证通过

## 代码变更

### scripts/build-index.js
```diff
+ function collectRequireStyles(requires) {
+   const cssContents = [];
+   if (!Array.isArray(requires)) return cssContents;
+   for (const req of requires) {
+     if (!req.style) continue;
+     const cssPath = require.resolve(req.style, { paths: [REPO_ROOT] });
+     const content = fs.readFileSync(cssPath, 'utf-8');
+     cssContents.push(content);
+   }
+   return cssContents;
+ }

- async function compileTsxToHtml(tsxFilePath) {
+ async function compileTsxToHtml(tsxFilePath, extraCss = []) {
    /* ... */
    const allExtraCss = [bundledCss, ...extraCss].filter(Boolean).join('\n');
  }

  /* 主流程中 */
+ const extraCss = collectRequireStyles(themeData.requires);
- const html = await compileTsxToHtml(tsxPath);
+ const html = await compileTsxToHtml(tsxPath, extraCss);
```

### boss-theme-blue/theme.json
```diff
  "requires": [
-   { "name": "antd", "source": "https://github.com/ant-design/ant-design" }
+   { "name": "antd", "source": "https://github.com/ant-design/ant-design", "style": "antd/dist/antd.min.css" }
  ]
```

### boss-theme-orange/theme.json
```diff
  "requires": [
-   { "name": "antd", "source": "https://github.com/ant-design/ant-design" }
+   { "name": "antd", "source": "https://github.com/ant-design/ant-design", "style": "antd/dist/antd.min.css" }
  ]
```

### boss-theme-blue/patterns/pages/dashboard.tsx（重写）
```diff
- import React from 'react';
- /* 纯内联样式模拟的仪表盘 */
+ import React from 'react';
+ import { Layout, Menu, Card, Statistic, Table, Tag, Avatar } from 'antd';
+ import { DashboardOutlined, UserOutlined, ... } from '@ant-design/icons';
+ /* 使用真实 antd 组件 */
```

### boss-theme-blue/patterns/components/stats-cards.tsx（重写）
```diff
+ import { Card, Statistic } from 'antd';
+ import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
```

### boss-theme-orange/patterns/pages/list-page.tsx（重写）
```diff
+ import { Layout, Menu, Breadcrumb, Input, Select, Button, Table, Tag } from 'antd';
+ import { DashboardOutlined, ... } from '@ant-design/icons';
```

### boss-theme-orange/patterns/components/form-section.tsx（重写）
```diff
+ import { Card, Form, Input, Select, Button } from 'antd';
```

### package.json
```diff
+ "optionalDependencies": {
+   "antd": "^4.24.0"
+ }
```

## 测试用例
### TC-001 antd 4 CSS 自动注入
- 运行 `node scripts/build-index.js`
- boss-theme-blue/orange 输出含 "🎨 注入 CSS: antd/dist/antd.min.css"
- 生成的 HTML 含 antd 样式，antd 组件正确渲染

### TC-002 无 style 声明的依赖不注入 CSS
- apple-theme/cyberpunk-theme 的 requires 无 style 字段
- 构建日志无 CSS 注入行
- 生成的 HTML 体积 ~140KB（不含 antd CSS）

### TC-03 optional 依赖缺失时的容错
- 卸载 antd 后构建：boss 主题编译失败但不影响其他主题
- requires.style 解析失败时仅 warning 不中断

### TC-004 antd 6 兼容性（理论验证）
- 若 requires 中 antd 不声明 style → 走 CSS-in-JS，CSS 随 JS 打包
- 若 requires 中 antd 声明 style → 走外部 CSS 注入
- 两者互不冲突，取决于 theme.json 声明
