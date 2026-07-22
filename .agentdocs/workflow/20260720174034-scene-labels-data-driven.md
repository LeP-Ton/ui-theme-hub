# scene 中文映射从硬编码改为数据驱动

## 背景与目标
- 原来 scene 的 key 从数据动态提取，但中文显示名在 app.js 和 detail.js 中各硬编码一份映射
- 新增场景时需改两个文件，容易漏改，导致 chip 显示英文原始值
- 将映射集中到全局配置文件 theme.config.json，构建脚本读取后输出到 summary JSON，前端从数据读取

## 约束与原则
- theme.config.json 为唯一维护点，新增场景只需在 sceneLabels 中加一行
- 构建脚本只消费配置，不硬编码枚举
- 未映射的 scene 构建时输出警告，前端 fallback 为原始值，不阻断

## 阶段与 TODO
- [x] build-index.js 新增 SCENE_LABELS 常量，输出到 summary JSON 的 sceneLabels 字段
- [x] build-index.js 检测未映射 scene 并输出警告
- [x] app.js 删除硬编码映射，改为从 state.sceneLabels 读取
- [x] detail.js 删除硬编码映射，改为从 summary JSON 的 sceneLabels 读取
- [x] 构建验证通过

## 代码变更

### theme.config.json（新增）
```json
{
  "sceneLabels": {
    "c-end": "C端",
    "enterprise": "企业级",
    "game": "游戏"
  }
}
```

### scripts/build-index.js -7 +5
```diff
- /* ========== 场景中文映射（唯一维护点） ========== */
- const SCENE_LABELS = {
-   'c-end': 'C端',
-   'enterprise': '企业级',
-   'game': '游戏',
- };
+ /* ========== 加载全局配置 ========== */
+ const CONFIG_PATH = path.join(REPO_ROOT, 'theme.config.json');
+ const config = fs.existsSync(CONFIG_PATH)
+   ? JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))
+   : {};
+ const SCENE_LABELS = config.sceneLabels || {};
```

### docs/app.js -4 +3
```diff
  const state = {
    themes: [],
+   sceneLabels: {},     /* scene 中文映射（来自 themes-summary.json） */
    activeScene: null,
    ...
  };
```

```diff
      state.themes = data.themes || [];
+     state.sceneLabels = data.sceneLabels || {};
```

```diff
-   /* scene 显示名称映射 */
    function sceneLabel(scene) {
-     const map = { 'c-end': 'C端', 'enterprise': '企业级', 'game': '游戏' };
-     return map[scene] || scene;
+     return state.sceneLabels[scene] || scene;
    }
```

### docs/detail.js -2 +8
```diff
+   /* 加载 sceneLabels 映射（从 summary 获取，构建时集中维护） */
+   try {
+     const summaryRes = await fetch('./themes-summary.json');
+     if (summaryRes.ok) {
+       const summaryData = await summaryRes.json();
+       window.__sceneLabels = summaryData.sceneLabels || {};
+     }
+   } catch (e) { /* summary 加载失败不影响主流程 */ }
```

```diff
-   const sceneLabel = { 'c-end': 'C端', 'enterprise': '企业级', 'game': '游戏' };
-   const sceneBadge = `...${sceneLabel[theme.scene] || theme.scene}...`;
+   const sceneBadge = `...${escapeHTML(window.__sceneLabels?.[theme.scene] || theme.scene)}...`;
```

## 测试用例

### TC-001 summary JSON 包含 sceneLabels
- 类型：功能测试
- 优先级：高
- 前置条件：运行构建
- 操作步骤：检查 themes-summary.json 顶层是否有 sceneLabels 字段
- 预期结果：`sceneLabels: {"c-end":"C端","enterprise":"企业级","game":"游戏"}`
- 是否通过：✅ 已验证

### TC-002 未映射 scene 构建警告
- 类型：功能测试
- 优先级：中
- 前置条件：某主题 scene 为 "education"，SCENE_LABELS 中无此 key
- 操作步骤：运行构建
- 预期结果：输出 `⚠️ scene "education" 未在 SCENE_LABELS 中配置中文映射`
- 是否通过：✅ 已验证

### TC-003 前端动态读取 sceneLabels
- 类型：功能测试
- 优先级：高
- 前置条件：app.js 和 detail.js 不再包含硬编码映射
- 操作步骤：在浏览器打开列表页和详情页
- 预期结果：scene chip 显示中文（C端/企业级/游戏），而非英文 key
- 是否通过：待验证
