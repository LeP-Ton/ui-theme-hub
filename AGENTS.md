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
themes/                    # 主题源目录（包含法：所有主题在此）
├── {theme-dir}/           # 目录名即主题唯一标识（dir）
│   ├── theme.json         # 主题元数据 + 设计 tokens（无 id 字段，name 为中文显示名）
│   ├── patterns/
│   │   ├── pages/         # 页面级 .tsx 模板
│   │   └── components/    # 组件级 .tsx 模板
│   ├── previews/          # 预览截图
│   └── standards/         # 设计规范（预留）

docs/
├── index.html             # 主题列表页
├── detail.html/js/css     # 主题详情页（tokens 可视化 + pattern 预览/源码切换）
├── pattern-previews/      # 编译后的 .tsx 预览 HTML（自动生成）
├── theme-previews/        # 主题截图（自动复制）
├── themes-summary.json    # 轻量索引（自动生成，含 sceneLabels + 主题摘要）
└── themes/                # 单主题全量 JSON（自动生成，供详情页按需加载）
    └── {dir}.json

scripts/
└── build-index.js         # 构建脚本：扫描 themes/ → 校验 → 编译 tsx → 生成索引

theme.config.json          # 全局配置（sceneLabels 等集中维护点）
```

## 构建流程
1. `node scripts/build-index.js` 扫描 `themes/` 下所有含 `theme.json` 的子目录
2. 校验 theme.json 必填字段 + 类型 + name/dir 唯一性（统一在 validateTheme 中）
3. 复制主题预览图到 `docs/theme-previews/`
4. 编译 .tsx pattern 为独立 HTML（含 React 打包 + CSS 内联）到 `docs/pattern-previews/`
5. 生成 `docs/themes-summary.json`（轻量索引：含 sceneLabels 映射 + dir/name/scene/tags/description/主色等字段）
6. 生成 `docs/themes/{dir}.json`（单主题全量数据，供详情页按需加载）
7. 生成各主题 zip 包到 `docs/packages/`
8. 大小评估汇总：编译全程累计 `sizeViolations`，若有超限则 `process.exit(1)` 中断构建

## 大小评估机制（防止主题无限膨胀）
部署在 GitHub Pages，主题数量持续增长，编译期对上下文消耗与文件大小做硬门禁。

**评估依据**（ui-design-skill 真实上下文消费链路，见 ui-design-skill/SKILL.md）：
- Phase 1 场景识别：远程读 `themes-summary.json`（每次必读）→ 决定主题总数上限
- Phase 2 主题加载：下载 zip 解压到本地后，按需读 `theme.json` / `patterns/*.tsx` / `standards/*.md`
- 故源文件（进 AI 上下文）卡紧，编译产物（展示/传输用）防失控即可

**双量化维度**（关键设计）：
- **source 组用 token 数**：进 AI 上下文的文件，token 才是真实上下文消耗。用 `gpt-tokenizer`（cl100k_base）计数。本系统面向通用 AI agent，不绑定特定模型；不同模型分词器略有差异，故为近似值，数量级准确。
- **output 组用字节数**：图片/HTML/zip 是传输存储成本，不进上下文，token 数对图片无意义。
- 同样 12KB 文件，重复内容仅 ~2500 token，多样化内容可达 ~40000 token——token 量化比字节更准确反映上下文消耗。

**阈值配置**：集中在 `theme.config.json` 的 `sizeLimits` 字段。对象写法 `{limit, unit, description}` 中 `unit` 含 `token` → token 维度，否则字节维度；兼容数字写法（默认字节）。`_doc` 字段为纯说明，构建时跳过。构建脚本通过 `resolveLimit`/`resolveLimitGroup` 解析，`assertBudget`（token/字节双模式）处理 source，`assertBytes` 处理 output。

| 对象 | 阈值 | 维度 | 字段 |
|------|------|------|------|
| theme.json | 2500 | tokens | `source.themeJson` |
| patterns/*.tsx | 4000 | tokens | `source.patternTsx` |
| standards/*.md | 2500 | tokens | `source.standardMd` |
| 单主题上下文总和 | 15000 | tokens | `source.themeContextTotal` |
| themes-summary.json | 16000 | tokens | `source.summaryJson` |
| pattern-preview HTML | 2M | bytes | `output.patternPreviewHtml` |
| 预览图 | 4M | bytes | `output.previewImage` |
| zip 包 | 2M | bytes | `output.themeZip` | 卡单主题下载包总量（含 assets，不含 previews），与 assetFile 512KB 协调 |
| assets 单文件 | 512K | bytes | `output.assetFile` |

**超限处理**：不立即抛错，统一收集到 `sizeViolations`，main() 末尾判定，有任一超限即 fail build（退出码 1）并打印修复指引（source 项显示 tokens，output 项显示 KB）。阈值按现状最大值留 1.7×~2.6× 余量设定，现状 5 主题全部通过。

**新增字段**：主题对象新增 `standards`（此前构建未扫描）与 `contextTokens`（单主题上下文 token 数，原 `contextBytes` 已重命名），透传进 detail.json，对前端透明。

## 主题标识体系
- **dir（目录名）**：唯一标识，用于 URL 路由、zip 文件名、详情 JSON 文件名、installed 参数匹配
- **name**：用户可见的中文显示名，必须全局唯一，用于卡片标题、搜索匹配
- **id 字段已废弃**：原 id 与 dir 冗余，已删除；theme.json 中若残留 id 会触发构建警告

## 构建校验规则
- **强校验（errors — 阻止入库）**：必填字段缺失、字段类型不匹配、dir 重复、name 重复
- **弱校验（warnings — 允许入库）**：id 废弃字段、tokens 缺失、patterns 空目录、scene 未映射中文

## 场景映射体系
- **theme.config.json**（项目根目录）：全局配置，sceneLabels 为 scene key → `{ label, color }` 对象的唯一维护点（label 中文显示名，color 场景标签专属色）
- 当前场景体系（key 用国际通用术语，中文简洁对仗）：`b2c`(C端) / `b2b`(B端) / `game`(游戏) / `presentation`(演示)。b2c/b2b 按商业模型兜底通用产品，game/presentation 为特殊形态单列
- 构建脚本读取 theme.config.json，原样透传 sceneLabels 对象到 `themes-summary.json`
- 前端（app.js / detail.js）从数据读取 label 与 color：label 渲染中文显示名，color 在启动时动态注入为 CSS 变量并内联到每个场景标签的 `--scene-color`
- CSS（style.css / detail.css）不再枚举 scene key，统一用 `var(--scene-color, var(--scene-fallback))` 通用规则着色
- **新增场景只需在 `theme.config.json` 的 `sceneLabels` 加一行 `{ label, color }`，构建后前端自动生效，无需改 CSS**（数据驱动）
- 未映射 scene 或缺 label/color 构建时输出警告；前端 label 回退为原始值，color 回退为兜底灰色 `--scene-fallback`

## CSS 处理机制
CSS 由 .tsx 中的 import 驱动，esbuild css loader 自动提取到 out.css 并内联到 HTML：
- `import 'antd/dist/antd.min.css'` → esbuild 提取 CSS → 内联 HTML `<style>`
- CSS-in-JS 库（antd 6 等）→ 样式随 JS 自动打包，无需 import CSS
- theme.json requires 仅作为元数据，不参与构建逻辑

## 当前主题
| 目录名 (dir) | 显示名 (name) | 场景 | 主色 | Patterns |
|--------------|---------------|------|------|----------|
| ai-ppt-theme | Poem PPT | 演示 | #ff6a3d (橙) | slide-deck, dual-column-card |
| apple-theme | Apple 风格 | C端 | #fa8c16 (橙) | landing-page, feature-grid |
| boss-theme-blue | Boss蓝 | B端 | #1677ff (蓝) | dashboard, stats-cards |
| boss-theme-orange | Boss橙 | B端 | #ff6600 (橙) | list-page, form-section |
| cyberpunk-theme | 赛博朋克 | 游戏 | #177ddc (蓝紫) | game-hud, character-panel |

## URL 参数规范
外部系统（如 ui-design-skill）可通过 query string 控制页面状态：
- `?scene=b2b` — 按场景筛选
- `?tags=blue,management` — 按标签筛选（逗号分隔）
- `?q=管理` — 搜索关键词回填
- `?installed=apple-theme,boss-theme-blue` — 已下载主题标记并排前（按 dir 匹配）
- 组合示例：`?scene=b2b&installed=boss-theme-blue`

## 下载机制
页面「下载」按钮 → 下载主题 zip 包（仅含主题目录） → 用户自行解压放置到目标目录

主题包构建：build-index.js 为每个主题生成 `{dir}.zip`（仅含主题目录），输出到 `docs/packages/`

关键特性：
- 下载文件名拼时间戳（`{dir}-{timestamp}.zip`），避免 Finder 重复下载追加括号
- zip 纯净，只含主题文件，不含安装脚本
- 构建时生成 zip，前端直接下载

## 关键认知
- 主题源目录统一放在 `themes/` 下，构建脚本用包含法识别（themes/ 子目录含 theme.json 即为主题）
- 旧版用排除法扫描根目录，每加非主题目录需改排除列表，已废弃
- Pattern .tsx 可使用内联样式或第三方组件库（如 antd），由主题定位决定
- CSS 通过 import 驱动，构建脚本不硬编码任何库的 CSS 路径
- esbuild `write: false` 在此环境下 outputFiles 为空，需用 `write: true` + 读文件
- esbuild `loader: { '.css': 'css' }` 将 import 的 CSS 提取到 out.css
- React 18 不再通过 exports 暴露 UMD 路径，需全部打包进 bundle
- 详情页 Pattern 支持「预览」（iframe）和「源码」（代码展示）模式切换
- antd 为 optionalDependencies，未安装时仅影响使用 antd 的主题构建
- 主题唯一标识为目录名（dir），theme.json 无 id 字段，name 为中文显示名
- URL 筛选参数从 hash 迁移到 search query string，方便外部系统拼接链接
