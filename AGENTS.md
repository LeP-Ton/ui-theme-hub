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
{theme-dir}/              # 目录名即主题唯一标识（dir）
├── theme.json            # 主题元数据 + 设计 tokens（无 id 字段，name 为中文显示名）
├── patterns/
│   ├── pages/            # 页面级 .tsx 模板
│   └── components/       # 组件级 .tsx 模板
├── previews/             # 预览截图
└── standards/            # 设计规范（预留）

docs/
├── index.html            # 主题列表页
├── detail.html/js/css    # 主题详情页（tokens 可视化 + pattern 预览/源码切换）
├── pattern-previews/     # 编译后的 .tsx 预览 HTML（自动生成）
├── theme-previews/       # 主题截图（自动复制）
├── themes-summary.json   # 轻量索引（自动生成，供列表页和 AI 场景识别）
└── themes/               # 单主题全量 JSON（自动生成，供详情页按需加载）
    └── {dir}.json

scripts/
└── build-index.js        # 构建脚本：扫描主题 → 校验 → 编译 tsx → 生成索引

theme.config.json            # 全局配置（sceneLabels 等集中维护点）
```

## 构建流程
1. `node scripts/build-index.js` 扫描所有含 `theme.json` 的目录
2. 校验 theme.json 必填字段（name/version/description/author/scene/tags）+ 类型 + name 唯一性
3. 复制主题预览图到 `docs/theme-previews/`
4. 编译 .tsx pattern 为独立 HTML（含 React 打包 + CSS 内联）到 `docs/pattern-previews/`
5. 生成 `docs/themes-summary.json`（轻量索引：含 sceneLabels 映射 + dir/name/scene/tags/description/主色等字段）
6. 生成 `docs/themes/{dir}.json`（单主题全量数据，供详情页按需加载）
7. 原 `docs/themes-index.json` 已废弃

## 主题标识体系
- **dir（目录名）**：唯一标识，用于 URL 路由、zip 文件名、详情 JSON 文件名、installed 参数匹配
- **name**：用户可见的中文显示名，必须全局唯一，用于卡片标题、搜索匹配
- **id 字段已废弃**：原 id 与 dir 冗余，已删除；theme.json 中若残留 id 会触发构建警告

## 构建校验规则
- **errors（阻止入库）**：缺少必填字段、字段类型不匹配、name 重复
- **warnings（允许入库）**：id 废弃字段、tokens 缺失、patterns 空目录、scene 未映射中文

## 场景映射体系
- **theme.config.json**（项目根目录）：全局配置，sceneLabels 为 scene key → 中文显示名的唯一维护点
- 构建脚本读取 theme.config.json，输出 sceneLabels 到 `themes-summary.json`
- 前端（app.js / detail.js）从数据读取，不再硬编码映射
- 新增场景只需在 `theme.config.json` 的 `sceneLabels` 加一行，前端自动生效
- 未映射的 scene 构建时输出警告，前端 fallback 为英文原始值

## CSS 处理机制
CSS 由 .tsx 中的 import 驱动，esbuild css loader 自动提取到 out.css 并内联到 HTML：
- `import 'antd/dist/antd.min.css'` → esbuild 提取 CSS → 内联 HTML `<style>`
- CSS-in-JS 库（antd 6 等）→ 样式随 JS 自动打包，无需 import CSS
- theme.json requires 仅作为元数据，不参与构建逻辑

## 当前主题
| 目录名 (dir) | 显示名 (name) | 场景 | 主色 | Patterns |
|--------------|---------------|------|------|----------|
| apple-theme | Apple 风格 | C端 | #fa8c16 (橙) | landing-page, feature-grid |
| boss-theme-blue | 企业蓝 | 企业级 | #1677ff (蓝) | dashboard, stats-cards |
| boss-theme-orange | 企业橙 | 企业级 | #ff6600 (橙) | list-page, form-section |
| cyberpunk-theme | 赛博朋克 | 游戏 | #177ddc (蓝紫) | game-hud, character-panel |

## URL 参数规范
外部系统（如 ui-design-skill）可通过 query string 控制页面状态：
- `?scene=enterprise` — 按场景筛选
- `?tags=blue,management` — 按标签筛选（逗号分隔）
- `?q=管理` — 搜索关键词回填
- `?installed=apple-theme,boss-theme-blue` — 已下载主题标记并排前（按 dir 匹配）
- 组合示例：`?scene=enterprise&installed=boss-theme-blue`

## 下载机制
页面「下载」按钮 → 下载主题 zip 包（仅含主题目录） → 用户自行解压放置到目标目录

主题包构建：build-index.js 为每个主题生成 `{dir}.zip`（仅含主题目录），输出到 `docs/packages/`

关键特性：
- 下载文件名拼时间戳（`{dir}-{timestamp}.zip`），避免 Finder 重复下载追加括号
- zip 纯净，只含主题文件，不含安装脚本
- 构建时生成 zip，前端直接下载

## 关键认知
- Pattern .tsx 可使用内联样式或第三方组件库（如 antd），由主题定位决定
- CSS 通过 import 驱动，构建脚本不硬编码任何库的 CSS 路径
- esbuild `write: false` 在此环境下 outputFiles 为空，需用 `write: true` + 读文件
- esbuild `loader: { '.css': 'css' }` 将 import 的 CSS 提取到 out.css
- React 18 不再通过 exports 暴露 UMD 路径，需全部打包进 bundle
- 详情页 Pattern 支持「预览」（iframe）和「源码」（代码展示）模式切换
- antd 为 optionalDependencies，未安装时仅影响使用 antd 的主题构建
- 主题唯一标识为目录名（dir），theme.json 无 id 字段，name 为中文显示名
- URL 筛选参数从 hash 迁移到 search query string，方便外部系统拼接链接
