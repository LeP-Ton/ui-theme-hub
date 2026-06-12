# 主题 ID + URL 参数：已下载标记与筛选回填

## 背景与目标
- ui-design-skill 需要通过 URL 跳转到 Theme Hub 页面并识别已下载的主题
- URL 参数需支持筛选（scene/tags/q）和已下载标记（installed），方便外部系统拼接链接

## 方案设计

### 主题 ID
- theme.json 新增 `id` 字段，作为主题的唯一标识
- 当前 id 与 dir（目录名）一致，但 id 是显式声明，未来可独立变化

### URL 参数规范（query string）
```
?scene=enterprise                    按场景筛选
&tags=blue,management                按标签筛选（逗号分隔）
&q=管理                              搜索关键词回填
&installed=apple-theme,boss-theme-blue  已下载主题 ID（逗号分隔）
```

### 交互行为
1. **installed 参数**：匹配 id/dir 的主题卡片打「✓ 已下载」标记，排在列表最前
2. **scene/tags/q 参数**：页面加载时自动激活筛选 + 回填搜索框
3. **用户操作同步**：用户点击筛选/搜索时，URL 参数同步更新（replaceState）
4. **详情页联动**：卡片「查看详情」链接带 `&installed=1`，详情页 header 显示已下载标记
5. **浏览器前进/后退**：popstate 事件重新解析 URL 参数

### URL 从 hash 迁移到 search
- 旧方案：`#scene=enterprise&tags=blue`（hash）
- 新方案：`?scene=enterprise&tags=blue`（query string）
- 原因：外部系统（ui-design-skill）拼接链接更标准，且 search 参数可被服务端读取

## 当前进展
- ✅ 4 个主题 theme.json 加 id 字段
- ✅ 首页 app.js 支持 installed 排序+标记、URL 参数解析/同步
- ✅ 详情页 detail.js 支持 installed 标记
- ✅ CSS 已下载标记样式
- ✅ URL 从 hash 迁移到 search query string

## 代码变更

### 4 个 theme.json
```diff
  {
+   "id": "apple-theme",
    "name": "apple-theme",
```

### docs/app.js
```diff
+ installedIds: new Set(),

- parseURLHash();
+ parseURLParams();
- updateURLHash();
+ updateURLParams();

+ /* 已下载排序 */
+ filtered.sort((a, b) => {
+   const aInstalled = state.installedIds.has(a.id || a.dir) ? 0 : 1;
+   const bInstalled = state.installedIds.has(b.id || b.dir) ? 0 : 1;
+   return aInstalled - bInstalled;
+ });

+ const isInstalled = state.installedIds.has(themeId);
+ <span class="installed-badge">已下载</span>
+ <article class="theme-card${isInstalled ? ' installed' : ''}">

+ function parseURLParams() {
+   /* 从 window.location.search 读取 scene/tags/q/installed */
+ }
+ function updateURLParams() {
+   /* replaceState 更新 URL，保留 installed 参数 */
+ }

- window.addEventListener('hashchange', ...)
+ window.addEventListener('popstate', ...)
```

### docs/detail.js
```diff
+ const isInstalled = params.has('installed');
- renderDetail(theme);
+ renderDetail(theme, isInstalled);
+ ${isInstalled ? '<span class="detail-installed-badge">已下载</span>' : ''}
```

### docs/style.css
```diff
+ .installed-badge { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
+ .theme-card.installed { border: 2px solid #86efac; }
+ .theme-card.installed .card-preview::after { /* 顶部绿色渐变条 */ }
```

### docs/detail.css
```diff
+ .detail-installed-badge { background: #f0fdf4; color: #16a34a; }
```

## 测试用例
### TC-001 installed 标记与排序
- 访问 `?installed=apple-theme,cyberpunk-theme`
- apple-theme 和 cyberpunk-theme 卡片显示「✓ 已下载」标记
- 它们排在列表最前，其他主题按原顺序排列

### TC-002 筛选参数回填
- 访问 `?scene=enterprise&tags=blue`
- 企业级场景筛选自动激活，blue 标签自动激活

### TC-003 搜索关键词回填
- 访问 `?q=管理`
- 搜索框自动填入「管理」，结果自动筛选

### TC-004 组合参数
- 访问 `?scene=enterprise&installed=boss-theme-blue`
- 企业级筛选激活 + boss-theme-blue 显示已下载标记并排前

### TC-005 详情页已下载标记
- 从首页已下载卡片的「查看详情」进入
- 详情页 header 显示「✓ 已下载」标记

### TC-006 用户操作同步 URL
- 用户点击筛选/搜索后，URL 参数同步更新
- 复制 URL 可在新标签页恢复相同筛选状态
