# UI Theme Hub

UI 主题资产管理中心，为 [ui-design-skill](https://github.com/LeP-Ton/ui-design-skill.git) 提供可用主题的浏览、检索与下载服务。

在线站点：通过 GitHub Pages 部署，支持按场景/标签筛选、关键词搜索、主题详情查看与一键下载。

---

## 主题一览

| 目录名 (dir) | 显示名 | 场景 | 主色 | 页面模板 | 组件模板 |
|--------------|--------|------|------|----------|----------|
| `apple-theme` | Apple 风格 | C端 | #fa8c16 🟠 | landing-page | feature-grid |
| `boss-theme-blue` | 企业蓝 | 企业级 | #1677ff 🔵 | dashboard | stats-cards |
| `boss-theme-orange` | 企业橙 | 企业级 | #ff6600 🟠 | list-page | form-section |
| `cyberpunk-theme` | 赛博朋克 | 游戏 | #177ddc 🟣 | game-hud | character-panel |

---

## 项目结构

```
ui-theme-hub/
├── themes/                    # 主题源目录（所有主题在此）
│   ├── apple-theme/
│   ├── boss-theme-blue/
│   ├── boss-theme-orange/
│   └── cyberpunk-theme/
├── docs/                      # 构建产物（GitHub Pages 部署源）
│   ├── index.html             # 主题列表页
│   ├── detail.html/js/css     # 主题详情页
│   ├── themes-summary.json    # 轻量索引（列表页用）
│   ├── themes/                # 单主题全量 JSON（详情页按需加载）
│   ├── pattern-previews/      # .tsx 编译后的独立 HTML 预览
│   ├── theme-previews/        # 主题截图
│   └── packages/              # 主题 zip 下载包
├── scripts/
│   └── build-index.js         # 构建脚本
└── theme.config.json          # 全局配置（场景映射等）
```

### 主题目录规范

每个主题是 `themes/` 下的一个子目录，包含 `theme.json` 即被识别为主题：

```
themes/{theme-dir}/
├── theme.json              # ✅ 必须：主题元数据 + 设计 tokens
├── patterns/
│   ├── pages/              # ✅ 建议至少 1 个：页面级 .tsx 模板
│   └── components/         # ⬜ 可选：组件级 .tsx 模板
├── previews/               # ⬜ 可选：预览截图（.png/.jpg/.webp）
├── standards/              # ⬜ 可选：设计规范 Markdown
└── assets/                 # ⬜ 可选：物料素材（预留）
    ├── icons/
    ├── illustrations/
    └── fragments/
```

---

## theme.json 规范

### 字段说明

| 字段 | 必须 | 类型 | 说明 |
|------|------|------|------|
| `name` | ✅ | string | 用户可见的中文显示名，**全局唯一** |
| `version` | ✅ | string | 语义化版本号（如 `"1.0.0"`） |
| `description` | ✅ | string | 主题简介 |
| `author` | ✅ | string | 作者/团队 |
| `scene` | ✅ | string | 场景标识，须在 [sceneLabels](#场景配置) 中有映射 |
| `tags` | ✅ | string[] | 标签数组，用于筛选和搜索 |
| `requires` | ⬜ | Array\<{name, source}> | 依赖声明（仅展示用，不参与构建） |
| `tokens` | ⬜ | object | 设计令牌，详见下方 tokens 结构 |
| ~~`id`~~ | ❌ 已废弃 | — | 主题标识统一使用目录名（dir），残留会触发构建警告 |

### 标识体系

- **dir（目录名）**：唯一标识，用于 URL 路由、zip 文件名、详情 JSON 文件名、`installed` 参数匹配
- **name**：中文显示名，全局唯一，用于卡片标题和搜索

> ⚠️ 不需要 `id` 字段。目录名天然唯一，`id` 字段已废弃。

### tokens 结构

`tokens` 为可选但强烈建议提供的完整设计令牌，包含 6 个子项：

```
tokens
├── color                    # 色彩
│   ├── primary              # 主色
│   ├── secondary            # 辅色
│   ├── accent               # 强调色
│   ├── success/warning/error/info  # 语义色
│   ├── background           # { base, elevated, muted }
│   ├── text                 # { primary, secondary, muted, inverse }
│   ├── border               # { default, muted }
│   └── extended             # ⬜ 自定义扩展（key 随场景变化）
├── spacing                  # 间距
│   ├── unit                 # 基础单位（如 4）
│   ├── scale                # 间距阶梯数组
│   └── extended             # ⬜ 自定义扩展
├── typography               # 排版
│   ├── fontFamily           # { base, heading, code }
│   ├── fontSize             # { xs, sm, base, lg, xl, 2xl, 3xl, 4xl }
│   ├── fontWeight           # { normal, medium, semibold, bold }
│   └── lineHeight           # { tight, base, relaxed }
├── border                   # 边框
│   ├── radius               # { none, sm, base, lg, xl, full }
│   └── width                # { thin, base, thick }
├── shadow                   # 阴影 { sm, base, lg, xl }
└── motion                   # 动效
    ├── enabled              # 是否启用
    ├── duration             # { fast, base, slow }
    └── easing               # { standard, decelerate, accelerate }
```

其中 `color.extended` 和 `spacing.extended` 是各主题的自定义扩展区，key 随场景自由定义（如 Apple 主题有 `heroGradientStart`，赛博朋克有 `rarityCommon`），没有固定 schema 约束。

### 示例

```json
{
  "name": "企业蓝",
  "version": "1.0.0",
  "description": "企业级管理系统蓝色效能主题，专业科技感",
  "author": "设计团队B",
  "scene": "enterprise",
  "tags": ["management", "enterprise", "boss platform", "blue"],
  "requires": [
    { "name": "antd", "source": "https://github.com/ant-design/ant-design" }
  ],
  "tokens": {
    "color": {
      "primary": "#1677ff",
      "secondary": "#597ef7",
      "accent": "#13c2c2",
      "success": "#52c41a",
      "warning": "#faad14",
      "error": "#ff4d4f",
      "info": "#1677ff",
      "background": { "base": "#ffffff", "elevated": "#ffffff", "muted": "#f5f5f5" },
      "text": { "primary": "rgba(0,0,0,0.88)", "secondary": "rgba(0,0,0,0.65)", "muted": "rgba(0,0,0,0.45)", "inverse": "#ffffff" },
      "border": { "default": "#d9d9d9", "muted": "#f0f0f0" },
      "extended": {
        "sidebarBg": "#001529",
        "sidebarActiveBg": "#1677ff"
      }
    },
    "spacing": { "unit": 4, "scale": [0,4,8,12,16,20,24,32,40,48,64,80,96] },
    "typography": {
      "fontFamily": { "base": "-apple-system, ...", "heading": "...", "code": "..." },
      "fontSize": { "xs": 12, "sm": 13, "base": 14, "lg": 16, "xl": 20, "2xl": 24, "3xl": 30, "4xl": 36 },
      "fontWeight": { "normal": 400, "medium": 500, "semibold": 600, "bold": 700 },
      "lineHeight": { "tight": 1.25, "base": 1.5, "relaxed": 1.75 }
    },
    "border": { "radius": { "none": 0, "sm": 4, "base": 6, "lg": 8, "xl": 12, "full": 9999 }, "width": { "thin": 1, "base": 1, "thick": 2 } },
    "shadow": { "sm": "0 1px 2px 0 rgba(0,0,0,0.03)", "base": "...", "lg": "...", "xl": "..." },
    "motion": { "enabled": true, "duration": { "fast": "0.1s", "base": "0.2s", "slow": "0.3s" }, "easing": { "standard": "cubic-bezier(0.4,0,0.2,1)", "decelerate": "...", "accelerate": "..." } }
  }
}
```

---

## 场景配置

场景（scene）的英文 key 和中文显示名集中维护在 `theme.config.json`：

```json
{
  "sceneLabels": {
    "c-end": "C端",
    "enterprise": "企业级",
    "game": "游戏"
  }
}
```

**工作流程**：

1. 构建时读取 `theme.config.json` 中的 `sceneLabels`
2. 输出到 `themes-summary.json` 的 `sceneLabels` 字段
3. 前端从数据读取映射，不再硬编码

**新增场景**：只需在 `theme.config.json` 的 `sceneLabels` 中加一行，前端自动生效。

**未映射场景**：构建时输出警告 `⚠️ scene "xxx" 未配置中文映射`，前端 fallback 显示英文 key。

---

## 构建与校验

### 构建

```bash
node scripts/build-index.js
```

构建流程：

1. 扫描 `themes/` 下所有含 `theme.json` 的子目录
2. 校验每个主题的格式和唯一性
3. 复制预览图到 `docs/theme-previews/`
4. 编译 `.tsx` pattern 为独立 HTML（esbuild + React 打包 + CSS 内联）
5. 生成 `docs/themes-summary.json`（轻量索引）
6. 生成 `docs/themes/{dir}.json`（单主题详情）
7. 生成 `docs/packages/{dir}.zip`（下载包）

### 校验规则

所有校验统一在 `validateTheme()` 函数中，分两级：

#### 强校验（errors — 阻止入库）

| 校验项 | 说明 |
|--------|------|
| 必填字段缺失 | name / version / description / author / scene / tags 任一缺失 |
| 字段类型不匹配 | name/version/scene 必须字符串，tags/requires 必须数组 |
| 目录名（dir）重复 | 两个主题目录同名（防御性检测） |
| name 重复 | 两个主题显示名冲突 |

#### 弱校验（warnings — 允许入库但提示）

| 校验项 | 说明 |
|--------|------|
| `id` 字段残留 | 已废弃，建议删除 |
| tokens 缺失 | 详情页无设计令牌展示 |
| tokens 子项缺失 | color/spacing/typography 等 |
| patterns/pages 为空 | 建议至少提供 1 个页面模板 |
| scene 未映射 | 该 scene 未在 theme.config.json 中配置中文 |

---

## 在线检索与 URL 参数

列表页支持通过 URL query string 控制筛选状态，方便外部系统（如 ui-design-skill）拼接链接直接定位：

| 参数 | 格式 | 说明 | 示例 |
|------|------|------|------|
| `scene` | 单值 | 按场景筛选 | `?scene=enterprise` |
| `tags` | 逗号分隔 | 按标签筛选（AND 逻辑） | `?tags=blue,management` |
| `q` | 自由文本 | 搜索（匹配 name/description/author/scene/tags） | `?q=管理` |
| `installed` | 逗号分隔 | 标记已下载主题（按 dir 匹配，排在前面） | `?installed=apple-theme,boss-theme-blue` |

组合示例：

```
?scene=enterprise&tags=blue&q=管理&installed=boss-theme-blue
```

详情页通过 `theme` 参数指定主题：

```
detail.html?theme=boss-theme-blue&installed=1
```

---

## 下载机制

- 列表页和详情页均提供「下载主题」按钮
- 下载内容为 zip 包（仅含主题目录，不含 previews）
- 文件名格式：`{dir}-{timestamp}.zip`（拼时间戳避免重复下载冲突）
- 用户解压后自行放置到目标目录

---

## 贡献新主题

1. 在 `themes/` 下创建新目录（目录名即主题标识 dir）
2. 添加 `theme.json`（必填：name / version / description / author / scene / tags）
3. 添加 `patterns/pages/` 下至少 1 个 `.tsx` 页面模板
4. 如使用了新场景，在 `theme.config.json` 的 `sceneLabels` 中添加映射
5. 运行 `node scripts/build-index.js` 确认校验通过
6. 提交 PR

### 开发 Pattern .tsx

- .tsx 文件使用 React 18 + esbuild 编译，支持 import 第三方组件库
- CSS 通过 `import` 驱动：`import 'antd/dist/antd.min.css'` 会被自动提取并内联
- CSS-in-JS 库（antd 6 等）的样式随 JS 打包，无需额外 import

---

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | 原生 HTML/CSS/JS（无框架），DOM 操作动态渲染 |
| 构建 | Node.js + esbuild（.tsx → 独立 HTML） |
| 部署 | GitHub Pages，从 `docs/` 目录部署 |
| CI | GitHub Actions，`**/theme.json` 变更时自动构建部署 |

---

## 许可证

MIT
