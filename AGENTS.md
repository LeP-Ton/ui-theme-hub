# UI Theme Hub — 项目认知

## 项目定位
UI 主题资产管理中心，采用纯静态站点架构，通过 GitHub Pages 部署。

## 技术栈
- **前端**：原生 HTML/CSS/JS（无框架），详情页通过 DOM 操作动态渲染
- **构建**：Node.js 脚本 + esbuild（编译 .tsx pattern 为独立 HTML）
- **部署**：GitHub Pages，从 `docs/` 目录部署
- **Pattern 系统**：.tsx → esbuild 编译 → 独立 HTML 预览 + 源码嵌入 JSON

## 目录结构
```
{theme-name}/
├── theme.json          # 主题元数据 + 设计 tokens
├── patterns/
│   ├── pages/          # 页面级 .tsx 模板
│   └── components/     # 组件级 .tsx 模板
├── previews/           # 预览截图
└── standards/          # 设计规范（预留）

docs/
├── index.html          # 主题列表页
├── detail.html/js/css  # 主题详情页（tokens 可视化 + pattern 预览/源码切换）
├── pattern-previews/   # 编译后的 .tsx 预览 HTML（自动生成）
├── theme-previews/     # 主题截图（自动复制）
└── themes-index.json   # 全量索引（自动生成）

scripts/
└── build-index.js      # 构建脚本：扫描主题 → 编译 tsx → 生成索引
```

## 构建流程
1. `node scripts/build-index.js` 扫描所有含 `theme.json` 的目录
2. 复制主题预览图到 `docs/theme-previews/`
3. 从 requires 中收集声明了 `style` 的依赖 CSS（如 antd.min.css）
4. 编译 .tsx pattern 为独立 HTML（含 React 打包 + 依赖 CSS 内联）到 `docs/pattern-previews/`
5. 生成 `docs/themes-index.json`（含 tokens、patterns source/preview 路径）

## CSS 注入机制
theme.json 的 requires 支持可选 `style` 字段，声明需内联到预览 HTML 的 CSS 路径：
- `"style": "antd/dist/antd.min.css"` → 从 node_modules 读取并注入 `<style>`
- 不声明 style → 不注入（CSS-in-JS 库如 antd 6 自动随 JS 打包）
- 同时支持 antd 4（需 CSS）和 antd 6（无需 CSS），取决于 theme.json 声明

## 当前主题
| 主题 | 场景 | 主色 | Patterns |
|------|------|------|----------|
| apple-theme | C端 | #fa8c16 (橙) | landing-page, feature-grid |
| boss-theme-blue | 企业级 | #1677ff (蓝) | dashboard, stats-cards |
| boss-theme-orange | 企业级 | #ff6600 (橙) | list-page, form-section |
| cyberpunk-theme | 游戏 | #177ddc (蓝紫) | game-hud, character-panel |

## 关键认知
- Pattern .tsx 可使用内联样式或第三方组件库（如 antd），由主题定位决定
- esbuild `write: false` 在此环境下 outputFiles 为空，需用 `write: true` + 读文件
- React 18 不再通过 exports 暴露 UMD 路径，需全部打包进 bundle
- 详情页 Pattern 支持「预览」（iframe）和「源码」（代码展示）模式切换
- antd 为 optionalDependencies，未安装时仅影响使用 antd 的主题构建
- 构建脚本通过 requires.style 声明驱动 CSS 注入，不硬编码任何库
