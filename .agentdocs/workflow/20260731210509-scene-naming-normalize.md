# 场景分类命名规范化：c-end/enterprise → b2c/b2b，演讲→演示

## 背景与目标
- 原场景分类存在三类问题：
  1. **分类维度不统一**：`c-end`/`enterprise` 是终端类型维度，`game` 是行业维度，`presentation` 是内容形态维度，三者互斥性差（"游戏官网落地页"归 c-end 还是 game？边界模糊）。
  2. **key 命名风格不一致**：`c-end` 是中英混合缩写黑话，与 `enterprise`/`game`/`presentation` 纯英文风格割裂；`apple-theme` 的 tags 复用了 `c-end`，不规范会沿用到 tag。
  3. **映射偏窄**：`presentation`→「演讲」只覆盖"对人讲话"子场景，PPT 同样用于自学/汇报/产品介绍等非演讲场景。
- 经多轮讨论（见会话-1~4）确定方案：保留 C端/B端 这套简洁、国内熟悉、对现有主题概括准确的中文，但 key 改用国际通用术语 `b2c`/`b2b`，同时 `presentation` 映射改为「演示」。
- 最终 scene 体系：`b2c`(C端) / `b2b`(B端) / `game`(游戏) / `presentation`(演示)。

## 约束与原则
- 保持现有行为不变，仅做命名与映射重构，不改构建逻辑。
- key 改动必须全链路同步：theme.config.json + 各 theme.json(scene/tags) + 规范文件名 + 文档示例，避免出现未映射 scene（会触发构建警告 + 前端 fallback 英文）。
- 自然语言描述中的「企业级」「演讲」（如 theme.json description、tsx 注释、营销文案）是合理措辞，保留不动。

## 阶段与 TODO
- [x] 全局搜索 `c-end`/`enterprise` 所有引用，区分源文件与 docs/ 生成物。
- [x] theme.config.json：sceneLabels 四项 key 与映射更新。
- [x] apple-theme/theme.json：scene `c-end`→`b2c`，tags 首项同步。
- [x] boss-theme-blue/theme.json：scene `enterprise`→`b2b`，tags 同步。
- [x] boss-theme-orange/theme.json：scene `enterprise`→`b2b`，tags 同步。
- [x] 规范文件改名 `standards/c-end.md` → `standards/b2c.md`（git mv 保留历史），同步文档内引用路径 `templates/scenes/c-end/` → `templates/scenes/b2c/`。
- [x] AGENTS.md：URL 参数示例 `?scene=enterprise`→`?scene=b2b`；当前主题表 name 列修正历史滞后（AI演示稿→Poem PPT、企业蓝→Boss蓝、企业橙→Boss橙）+ scene 列同步。
- [x] README.md：主题一览表（补 ai-ppt-theme 行 + boss 两行 name/scene 同步）、示例 theme.json、sceneLabels 示例、URL 示例。
- [x] 跑构建校验：无 scene 未映射警告，name/dir 唯一性通过，大小评估通过。
- [x] 校验生成物 themes-summary.json 的 sceneLabels 与各主题 scene 正确。

## 关键风险
- key 改动若有遗漏点（如未发现的引用），会导致该主题 scene 未映射，前端筛选失效并 fallback 英文。已通过全局 grep + 构建校验双保险确认无遗漏。
- 规范文件改名影响进 AI 上下文的文件路径，但 standards 是按目录扫描、文件名不参与 scene 逻辑，改名安全。
- AGENTS.md「当前主题」表 name 列与 theme.json 实际值长期不同步（历史问题），借本次一并修正，避免认知文档持续误导。

## 当前进展
- 全部改动已应用，构建通过，生成物校验通过。

## 代码变更

### theme.config.json
```diff
   "sceneLabels": {
-    "c-end": "C端",
-    "enterprise": "企业级",
+    "b2c": "C端",
+    "b2b": "B端",
     "game": "游戏",
-    "presentation": "演讲"
+    "presentation": "演示"
   },
```

### themes/apple-theme/theme.json
```diff
-  "scene": "c-end",
-  "tags": ["c-end", "marketing", "mobile", "apple", "elegant"],
+  "scene": "b2c",
+  "tags": ["b2c", "marketing", "mobile", "apple", "elegant"],
```

### themes/boss-theme-blue/theme.json
```diff
-  "scene": "enterprise",
-  "tags": ["management", "enterprise", "boss platform", "blue"],
+  "scene": "b2b",
+  "tags": ["management", "b2b", "boss platform", "blue"],
```

### themes/boss-theme-orange/theme.json
```diff
-  "scene": "enterprise",
-  "tags": ["management", "enterprise", "boss platform", "orange"],
+  "scene": "b2b",
+  "tags": ["management", "b2b", "boss platform", "orange"],
```

### themes/apple-theme/standards/c-end.md → b2c.md（git mv 重命名）
文件内引用路径同步：
```diff
-| 首页 | Hero+特性+内容+CTA | `templates/scenes/c-end/pages/home-page.md` |
-| 产品详情 | 图片+信息+操作 | `templates/scenes/c-end/pages/product-page.md` |
-| 个人中心 | 信息+设置+操作 | `templates/scenes/c-end/pages/profile-page.md` |
+| 首页 | Hero+特性+内容+CTA | `templates/scenes/b2c/pages/home-page.md` |
+| 产品详情 | 图片+信息+操作 | `templates/scenes/b2c/pages/product-page.md` |
+| 个人中心 | 信息+设置+操作 | `templates/scenes/b2c/pages/profile-page.md` |
```

### AGENTS.md
URL 参数示例：
```diff
-- `?scene=enterprise` — 按场景筛选
+- `?scene=b2b` — 按场景筛选
```
```diff
-- 组合示例：`?scene=enterprise&installed=boss-theme-blue`
+- 组合示例：`?scene=b2b&installed=boss-theme-blue`
```
当前主题表（同步修正 name 列历史滞后 + scene 列）：
```diff
-| ai-ppt-theme | AI 演示稿 | 演讲 | #ff6a3d (橙) | slide-deck, dual-column-card |
-| apple-theme | Apple 风格 | C端 | #fa8c16 (橙) | landing-page, feature-grid |
-| boss-theme-blue | 企业蓝 | 企业级 | #1677ff (蓝) | dashboard, stats-cards |
-| boss-theme-orange | 企业橙 | 企业级 | #ff6600 (橙) | list-page, form-section |
-| cyberpunk-theme | 赛博朋克 | 游戏 | #177ddc (蓝紫) | game-hud, character-panel |
+| ai-ppt-theme | Poem PPT | 演示 | #ff6a3d (橙) | slide-deck, dual-column-card |
+| apple-theme | Apple 风格 | C端 | #fa8c16 (橙) | landing-page, feature-grid |
+| boss-theme-blue | Boss蓝 | B端 | #1677ff (蓝) | dashboard, stats-cards |
+| boss-theme-orange | Boss橙 | B端 | #ff6600 (橙) | list-page, form-section |
+| cyberpunk-theme | 赛博朋克 | 游戏 | #177ddc (蓝紫) | game-hud, character-panel |
```

### README.md
主题一览表（补 ai-ppt-theme 行 + boss 两行同步）：
```diff
+| `ai-ppt-theme` | Poem PPT | 演示 | #ff6a3d 🟠 | slide-deck | dual-column-card |
 | `apple-theme` | Apple 风格 | C端 | #fa8c16 🟠 | landing-page | feature-grid |
-| `boss-theme-blue` | 企业蓝 | 企业级 | #1677ff 🔵 | dashboard | stats-cards |
-| `boss-theme-orange` | 企业橙 | 企业级 | #ff6600 🟠 | list-page | form-section |
+| `boss-theme-blue` | Boss蓝 | B端 | #1677ff 🔵 | dashboard | stats-cards |
+| `boss-theme-orange` | Boss橙 | B端 | #ff6600 🟠 | list-page | form-section |
 | `cyberpunk-theme` | 赛博朋克 | 游戏 | #177ddc 🟣 | game-hud | character-panel |
```
示例 theme.json 片段（与实际 boss-theme-blue 对齐）：
```diff
 {
-  "name": "企业蓝",
+  "name": "Boss蓝",
   "version": "1.0.0",
-  "description": "企业级管理系统蓝色效能主题，专业科技感",
+  "description": "Boss平台B端管理系统蓝色效能主题，专业科技感",
   "author": "设计团队B",
-  "scene": "enterprise",
-  "tags": ["management", "enterprise", "boss platform", "blue"],
+  "scene": "b2b",
+  "tags": ["management", "b2b", "boss platform", "blue"],
```
sceneLabels 示例：
```diff
   "sceneLabels": {
-    "c-end": "C端",
-    "enterprise": "企业级",
+    "b2c": "C端",
+    "b2b": "B端",
     "game": "游戏",
-    "presentation": "演讲"
+    "presentation": "演示"
```
URL 参数示例：
```diff
-| `scene` | 单值 | 按场景筛选 | `?scene=enterprise` |
+| `scene` | 单值 | 按场景筛选 | `?scene=b2b` |
```
```diff
-?scene=enterprise&tags=blue&q=管理&installed=boss-theme-blue
+?scene=b2b&tags=blue&q=管理&installed=boss-theme-blue
```

## 测试用例
### TC-001 构建无 scene 未映射警告
- 类型：构建校验
- 优先级：高
- 关联模块：scripts/build-index.js
- 前置条件：所有 theme.json scene 已改为新 key
- 操作步骤：
  1. 执行 `node scripts/build-index.js`
- 预期结果：
  - 构建成功，退出码 0
  - 无 "scene 未映射中文" 警告
  - 大小评估通过
- 是否通过：✅ 已验证（5 主题全部处理，无警告，大小评估通过）

### TC-002 生成索引 sceneLabels 正确
- 类型：数据校验
- 优先级：高
- 关联模块：themes-summary.json
- 前置条件：构建完成
- 操作步骤：
  1. 读取 docs/themes-summary.json 的 sceneLabels
  2. 读取各主题 scene 字段
- 预期结果：
  - sceneLabels = {b2c:C端, b2b:B端, game:游戏, presentation:演示}
  - apple→b2c, boss×2→b2b, ai-ppt→presentation, cyberpunk→game
- 是否通过：✅ 已验证

### TC-003 无旧 key 残留
- 类型：回归校验
- 优先级：中
- 关联模块：全仓库
- 操作步骤：
  1. grep 源文件中的 c-end / "enterprise" / 演讲 / 企业级
- 预期结果：
  - 仅剩自然语言描述中的合理措辞（theme.json description、tsx 注释、营销文案）
  - 无 scene key / sceneLabels / tags / URL 示例残留旧值
- 是否通过：✅ 已验证

### TC-004 前端场景筛选与 URL 参数
- 类型：功能测试
- 优先级：中
- 关联模块：docs/app.js
- 前置条件：docs/ 已部署
- 操作步骤：
  1. 打开首页，场景筛选应显示 C端/B端/游戏/演示
  2. 访问 ?scene=b2b，应只显示 Boss蓝/Boss橙
  3. 访问 ?scene=b2c，应只显示 Apple 风格
- 预期结果：
  - 筛选标签与结果正确
  - URL 参数 scene=b2b/b2c 生效
- 是否通过：待验证（需浏览器人工核对）
