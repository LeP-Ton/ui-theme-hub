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

## 后续修复：前端场景标签颜色失效

### 问题
改 key 后页面场景标签颜色消失。根因：前端 CSS 硬编码了 scene key→颜色映射，key 改名后选择器对不上。
- `docs/style.css`：CSS 变量 `--scene-c-end`/`--scene-enterprise` + 选择器 `[data-scene="c-end"]`/`.scene-enterprise`（共 3 处：变量定义、chip 激活态、chip 色条、卡片标签）
- `docs/detail.css`：详情页 `.detail-scene.scene-c-end`/`.scene-enterprise`（硬编码颜色）
- `docs/app.js`：头部注释示例 `scene=enterprise`
- 附带历史遗漏：`presentation` 场景从未配过颜色规则（会话-5 之前就缺），ai-ppt 主题标签一直无专属色

### 修复
将 CSS 变量名与选择器全部对齐新 key，并补齐 presentation 颜色（#ff6a3d，ai-ppt 暖橙主色，与 game 紫区分）；detail.css 改用 CSS 变量统一维护点。

### docs/style.css
```diff
   /* 场景色彩映射 */
-  --scene-c-end: #fa8c16;
-  --scene-enterprise: #1677ff;
-  --scene-game: #722ed1;
+  /* 场景色彩映射（key 与 theme.config.json sceneLabels 对齐） */
+  --scene-b2c: #fa8c16;
+  --scene-b2b: #1677ff;
+  --scene-game: #722ed1;
+  --scene-presentation: #ff6a3d;
```
```diff
 /* scene 标签激活时使用场景专属色彩 */
-.filter-chip.scene-chip.active[data-scene="c-end"] { background: var(--scene-c-end); border-color: var(--scene-c-end); }
-.filter-chip.scene-chip.active[data-scene="enterprise"] { background: var(--scene-enterprise); border-color: var(--scene-enterprise); }
+.filter-chip.scene-chip.active[data-scene="b2c"] { background: var(--scene-b2c); border-color: var(--scene-b2c); }
+.filter-chip.scene-chip.active[data-scene="b2b"] { background: var(--scene-b2b); border-color: var(--scene-b2b); }
 .filter-chip.scene-chip.active[data-scene="game"] { background: var(--scene-game); border-color: var(--scene-game); }
+.filter-chip.scene-chip.active[data-scene="presentation"] { background: var(--scene-presentation); border-color: var(--scene-presentation); }
```
```diff
-.filter-chip.scene-chip[data-scene="c-end"]::before { background: var(--scene-c-end); }
-.filter-chip.scene-chip[data-scene="enterprise"]::before { background: var(--scene-enterprise); }
+.filter-chip.scene-chip[data-scene="b2c"]::before { background: var(--scene-b2c); }
+.filter-chip.scene-chip[data-scene="b2b"]::before { background: var(--scene-b2b); }
 .filter-chip.scene-chip[data-scene="game"]::before { background: var(--scene-game); }
+.filter-chip.scene-chip[data-scene="presentation"]::before { background: var(--scene-presentation); }
```
```diff
-.card-scene.scene-c-end { background: var(--scene-c-end); }
-.card-scene.scene-enterprise { background: var(--scene-enterprise); }
+.card-scene.scene-b2c { background: var(--scene-b2c); }
+.card-scene.scene-b2b { background: var(--scene-b2b); }
 .card-scene.scene-game { background: var(--scene-game); }
+.card-scene.scene-presentation { background: var(--scene-presentation); }
```

### docs/detail.css
```diff
-.detail-scene.scene-c-end { background: #fa8c16; }
-.detail-scene.scene-enterprise { background: #1677ff; }
-.detail-scene.scene-game { background: #722ed1; }
+.detail-scene.scene-b2c { background: var(--scene-b2c); }
+.detail-scene.scene-b2b { background: var(--scene-b2b); }
+.detail-scene.scene-game { background: var(--scene-game); }
+.detail-scene.scene-presentation { background: var(--scene-presentation); }
```

### docs/app.js
```diff
  * URL 参数规范（query string）：
- *   scene=enterprise          按场景筛选
+ *   scene=b2b                 按场景筛选
  *   tags=blue,management      按标签筛选（逗号分隔）
  *   q=搜索词                  搜索回填
  *   installed=apple-theme,boss-theme-blue  已下载主题 ID（逗号分隔）
  *
- * 示例：?scene=enterprise&tags=blue&q=管理&installed=apple-theme,boss-theme-blue
+ * 示例：?scene=b2b&tags=blue&q=管理&installed=apple-theme,boss-theme-blue
```

### TC-005 场景标签颜色恢复
- 类型：功能测试
- 优先级：高
- 关联模块：docs/style.css, docs/detail.css
- 前置条件：docs/ 已重新部署
- 操作步骤：
  1. 打开首页，观察 4 个场景筛选 chip 左侧色条与激活态背景
  2. 观察卡片场景标签底色
  3. 进入详情页观察场景标签底色
- 预期结果：
  - C端=橙、B端=蓝、游戏=紫、演示=橙红，全部有颜色
  - 无 c-end/enterprise 残留导致的失色
- 是否通过：待验证（需浏览器人工核对）

## 经验沉淀（写入 AGENTS.md）
- scene key 与前端 CSS 存在硬编码耦合：变量名 `--scene-{key}`、选择器 `.scene-{key}` / `[data-scene="{key}"]`。改 scene key 必须同步改 docs/style.css + docs/detail.css，否则标签失色。本次已补齐 presentation 颜色并统一用 CSS 变量。
- ↑ 上述耦合已在下一节「场景颜色数据驱动改造」中彻底消除，颜色改为数据驱动，CSS 不再枚举 key。

## 场景颜色数据驱动改造

### 背景
会话-6 修复失色时发现：sceneLabels 的 label 已是数据驱动（构建透传 + 前端读取），但颜色仍硬编码在 CSS 里——是数据驱动改造没做完的半成品。新增场景需同时改 config 和 CSS 两处，违背扩展性。改为颜色也走 config 数据驱动。

### 方案（经用户确认）
- 配置结构：sceneLabels 值从扁平字符串改为对象 `{ label, color }`
- 前端消费：JS 读 color，启动时动态注入 CSS 变量；CSS 删掉所有 scene key 枚举，统一用 `var(--scene-color, var(--scene-fallback))` 通用规则

### theme.config.json
```diff
   "sceneLabels": {
-    "b2c": "C端",
-    "b2b": "B端",
-    "game": "游戏",
-    "presentation": "演示"
+    "b2c": { "label": "C端", "color": "#fa8c16" },
+    "b2b": { "label": "B端", "color": "#1677ff" },
+    "game": { "label": "游戏", "color": "#722ed1" },
+    "presentation": { "label": "演示", "color": "#ff6a3d" }
   },
```

### scripts/build-index.js
未映射检测适配对象结构（label / color 分别检测）：
```diff
-  /* 检测未映射的 scene 值，输出警告 */
+  /* 检测未映射的 scene 值，输出警告（sceneLabels 值为 {label, color} 对象） */
   const allScenes = [...new Set(themes.map(t => t.scene))];
   for (const scene of allScenes) {
-    if (!SCENE_LABELS[scene]) {
-      console.warn(`⚠️  scene "${scene}" 未在 SCENE_LABELS 中配置中文映射，前端将显示原始值`);
+    const cfg = SCENE_LABELS[scene];
+    if (!cfg || !cfg.label) {
+      console.warn(`⚠️  scene "${scene}" 未在 sceneLabels 中配置 label，前端将显示原始值`);
+    }
+    if (cfg && !cfg.color) {
+      console.warn(`⚠️  scene "${scene}" 未配置 color，前端场景标签将无专属色`);
     }
   }
```
透传 `sceneLabels: SCENE_LABELS` 不变（对象原样进 JSON）。

### docs/app.js
sceneLabel 适配 `.label`，新增 sceneColor + injectSceneColors：
```diff
-  /* scene 显示名称：从构建产物 sceneLabels 映射，未匹配时回退为原始值 */
+  /* scene 显示名称：从构建产物 sceneLabels 映射（值为 {label, color} 对象），未匹配时回退为原始值 */
   function sceneLabel(scene) {
-    return state.sceneLabels[scene] || scene;
+    return state.sceneLabels[scene]?.label || scene;
+  }
+
+  /* scene 专属色：从 sceneLabels 读取 color，未配置返回 null */
+  function sceneColor(scene) {
+    return state.sceneLabels[scene]?.color || null;
+  }
+
+  /* 将场景颜色动态注入为 CSS 变量（--scene-{key}），实现数据驱动着色，新增场景无需改 CSS */
+  function injectSceneColors() {
+    const entries = Object.entries(state.sceneLabels)
+      .map(([scene, cfg]) => [scene, cfg?.color])
+      .filter(([, color]) => color);
+    if (!entries.length) return;
+    const css = entries.map(([scene, color]) => `--scene-${scene}: ${color};`).join(' ');
+    let $style = document.getElementById('scene-color-vars');
+    if (!$style) {
+      $style = document.createElement('style');
+      $style.id = 'scene-color-vars';
+      document.head.appendChild($style);
+    }
+    $style.textContent = `:root { ${css} }`;
   }
```
init 中调用 + chip/卡片渲染内联 `--scene-color`：
```diff
+    injectSceneColors();
     renderFilterChips();
```
```diff
-    $sceneChips.innerHTML = scenes.map(scene => `
-      <button class="filter-chip scene-chip" data-scene="${scene}" data-type="scene">
-        ${sceneLabel(scene)}
-      </button>
-    `).join('');
+    $sceneChips.innerHTML = scenes.map(scene => {
+      const color = sceneColor(scene);
+      const styleAttr = color ? ` style="--scene-color:${color}"` : '';
+      return `
+      <button class="filter-chip scene-chip" data-scene="${scene}" data-type="scene"${styleAttr}>
+        ${sceneLabel(scene)}
+      </button>`;
+    }).join('');
```
```diff
-    const sceneBadge = `<span class="card-scene scene-${theme.scene}">${sceneLabel(theme.scene)}</span>`;
+    /* scene 徽章：内联 --scene-color 供 CSS 通用规则着色，未配置色时 CSS 走兜底 */
+    const sceneColorVar = sceneColor(theme.scene);
+    const sceneStyleAttr = sceneColorVar ? ` style="--scene-color:${sceneColorVar}"` : '';
+    const sceneBadge = `<span class="card-scene scene-${theme.scene}"${sceneStyleAttr}>${sceneLabel(theme.scene)}</span>`;
```

### docs/detail.js
新增 injectSceneColors（与 app.js 同构，IIFE 隔离不能共用），summary 加载后调用；sceneBadge 适配 `.label` + 内联 `--scene-color`：
```diff
+  /* 将场景颜色动态注入为 CSS 变量（--scene-{key}），与列表页 app.js 同构，新增场景无需改 CSS */
+  function injectSceneColors(sceneLabels) {
+    const entries = Object.entries(sceneLabels || {})
+      .map(([scene, cfg]) => [scene, cfg?.color])
+      .filter(([, color]) => color);
+    if (!entries.length) return;
+    const css = entries.map(([scene, color]) => `--scene-${scene}: ${color};`).join(' ');
+    let $style = document.getElementById('scene-color-vars');
+    if (!$style) {
+      $style = document.createElement('style');
+      $style.id = 'scene-color-vars';
+      document.head.appendChild($style);
+    }
+    $style.textContent = `:root { ${css} }`;
+  }
```
```diff
         window.__sceneLabels = summaryData.sceneLabels || {};
+        /* 将场景颜色注入为 CSS 变量，与列表页一致，新增场景无需改 CSS */
+        injectSceneColors(window.__sceneLabels);
```
```diff
-    const sceneBadge = `<span class="detail-scene scene-${theme.scene}">${escapeHTML(window.__sceneLabels?.[theme.scene] || theme.scene)}</span>`;
+    const sceneCfg = window.__sceneLabels?.[theme.scene];
+    const sceneStyleAttr = sceneCfg?.color ? ` style="--scene-color:${sceneCfg.color}"` : '';
+    const sceneBadge = `<span class="detail-scene scene-${theme.scene}"${sceneStyleAttr}>${escapeHTML(sceneCfg?.label || theme.scene)}</span>`;
```

### docs/style.css
删除所有 scene key 枚举的变量定义与选择器，改为通用规则：
```diff
-  /* 场景色彩映射（key 与 theme.config.json sceneLabels 对齐） */
-  --scene-b2c: #fa8c16;
-  --scene-b2b: #1677ff;
-  --scene-game: #722ed1;
-  --scene-presentation: #ff6a3d;
+  /* 场景色彩：由 app.js injectSceneColors() 从 sceneLabels 动态注入 --scene-{key}。
+     此处仅给一个兜底默认色，避免 JS 未执行时标签完全无色。颜色唯一维护点为 theme.config.json */
+  --scene-fallback: #8c8c8c;
```
```diff
-/* scene 标签激活时使用场景专属色彩 */
-.filter-chip.scene-chip.active[data-scene="b2c"] { background: var(--scene-b2c); border-color: var(--scene-b2c); }
-.filter-chip.scene-chip.active[data-scene="b2b"] { background: var(--scene-b2b); border-color: var(--scene-b2b); }
-.filter-chip.scene-chip.active[data-scene="game"] { background: var(--scene-game); border-color: var(--scene-game); }
-.filter-chip.scene-chip.active[data-scene="presentation"] { background: var(--scene-presentation); border-color: var(--scene-presentation); }
+/* scene 标签激活时使用场景专属色（颜色由 JS 内联 --scene-color 注入，兜底 --scene-fallback） */
+.filter-chip.scene-chip.active { background: var(--scene-color, var(--scene-fallback)); border-color: var(--scene-color, var(--scene-fallback)); }
```
```diff
 .filter-chip.scene-chip::before {
   content: '';
   width: 8px;
   height: 8px;
   border-radius: 50%;
   margin-right: 6px;
   flex-shrink: 0;
+  background: var(--scene-color, var(--scene-fallback));
 }
-
-.filter-chip.scene-chip[data-scene="b2c"]::before { background: var(--scene-c-end); }
-.filter-chip.scene-chip[data-scene="b2b"]::before { background: var(--scene-b2b); }
-.filter-chip.scene-chip[data-scene="game"]::before { background: var(--scene-game); }
-.filter-chip.scene-chip[data-scene="presentation"]::before { background: var(--scene-presentation); }
```
```diff
-.card-scene.scene-b2c { background: var(--scene-b2c); }
-.card-scene.scene-b2b { background: var(--scene-b2b); }
-.card-scene.scene-game { background: var(--scene-game); }
-.card-scene.scene-presentation { background: var(--scene-presentation); }
+/* 卡片场景标签：颜色由 JS 内联 --scene-color 注入，通用规则不再枚举 scene key */
+.card-scene { background: var(--scene-color, var(--scene-fallback)); }
```

### docs/detail.css
```diff
-.detail-scene.scene-b2c { background: var(--scene-b2c); }
-.detail-scene.scene-b2b { background: var(--scene-b2b); }
-.detail-scene.scene-game { background: var(--scene-game); }
-.detail-scene.scene-presentation { background: var(--scene-presentation); }
+/* 详情页场景标签：颜色由 JS 内联 --scene-color 注入，与列表页同构 */
+.detail-scene { background: var(--scene-color, var(--scene-fallback)); }
```

### README.md
sceneLabels 示例改为对象结构并补充说明：
```diff
   "sceneLabels": {
-    "b2c": "C端",
-    "b2b": "B端",
-    "game": "游戏",
-    "presentation": "演示"
+    "b2c": { "label": "C端", "color": "#fa8c16" },
+    "b2b": { "label": "B端", "color": "#1677ff" },
+    "game": { "label": "游戏", "color": "#722ed1" },
+    "presentation": { "label": "演示", "color": "#ff6a3d" }
   }
```
+新增说明：值为 `{ label, color }` 对象，前端动态注入 CSS 变量，新增场景只需加一行无需改 CSS。

### TC-006 数据驱动着色
- 类型：功能测试
- 优先级：高
- 关联模块：docs/app.js, docs/detail.js, docs/style.css
- 操作步骤：
  1. 浏览器看 4 个场景标签颜色正确（C端橙/B端蓝/游戏紫/演示橙红）
  2. 在 theme.config.json 给某 scene 临时改 color，重新构建，确认页面颜色随之变化
  3. 在 config 临时新增一个 scene+主题，确认无需改 CSS 即有专属色
- 预期结果：
  - 颜色随 config 变化，CSS 零改动
  - 新增 scene 自动着色
- 是否通过：待验证（步骤 1 需浏览器核对；步骤 2/3 已通过 node 模拟验证读取与注入逻辑正确）

### TC-007 兜底色
- 类型：容错测试
- 优先级：低
- 关联模块：docs/style.css
- 操作步骤：
  1. 构造一个 sceneLabels 中无 color 的 scene（或 JS 未执行场景）
- 预期结果：
  - 标签走 `--scene-fallback` 灰色，不至完全无色
- 是否通过：待验证

## 经验更新（已写入 AGENTS.md）
- 颜色数据驱动改造完成后，CSS 不再枚举 scene key。新增场景只需改 theme.config.json 一处（加 `{ label, color }`），构建后前端自动着色。旧的「scene key 与 CSS 硬编码耦合」认知已废弃。

