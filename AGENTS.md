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
3. 编译 .tsx pattern 为独立 HTML（含 React 打包 + CSS 内联）到 `docs/pattern-previews/`
4. 生成 `docs/themes-index.json`（含 tokens、patterns source/preview 路径）

## CSS 处理机制
CSS 由 .tsx 中的 import 驱动，esbuild css loader 自动提取到 out.css 并内联到 HTML：
- `import 'antd/dist/antd.min.css'` → esbuild 提取 CSS → 内联 HTML `<style>`
- CSS-in-JS 库（antd 6 等）→ 样式随 JS 自动打包，无需 import CSS
- theme.json requires 仅作为元数据，不参与构建逻辑

## 当前主题
| 主题 ID | 场景 | 主色 | Patterns |
|---------|------|------|----------|
| apple-theme | C端 | #fa8c16 (橙) | landing-page, feature-grid |
| boss-theme-blue | 企业级 | #1677ff (蓝) | dashboard, stats-cards |
| boss-theme-orange | 企业级 | #ff6600 (橙) | list-page, form-section |
| cyberpunk-theme | 游戏 | #177ddc (蓝紫) | game-hud, character-panel |

## URL 参数规范
外部系统（如 ui-design-skill）可通过 query string 控制页面状态：
- `?scene=enterprise` — 按场景筛选
- `?tags=blue,management` — 按标签筛选（逗号分隔）
- `?q=管理` — 搜索关键词回填
- `?installed=apple-theme,boss-theme-blue` — 已下载主题标记并排前
- 组合示例：`?scene=enterprise&installed=boss-theme-blue`

## 关键认知
- Pattern .tsx 可使用内联样式或第三方组件库（如 antd），由主题定位决定
- CSS 通过 import 驱动，构建脚本不硬编码任何库的 CSS 路径
- esbuild `write: false` 在此环境下 outputFiles 为空，需用 `write: true` + 读文件
- esbuild `loader: { '.css': 'css' }` 将 import 的 CSS 提取到 out.css
- React 18 不再通过 exports 暴露 UMD 路径，需全部打包进 bundle
- 详情页 Pattern 支持「预览」（iframe）和「源码」（代码展示）模式切换
- antd 为 optionalDependencies，未安装时仅影响使用 antd 的主题构建
- theme.json 的 `id` 字段为主题唯一标识，URL 参数 `installed` 按 id 匹配
- URL 筛选参数从 hash 迁移到 search query string，方便外部系统拼接链接
