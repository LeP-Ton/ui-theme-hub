# themes-index.json 拆为两层：轻量索引 + 按需详情

## 背景与目标
- themes-index.json 原本是全量索引（包含每个主题的完整 tokens + patterns 源码），同时服务于列表页、详情页
- 当主题数量增长到几十个时，文件会膨胀到上万行：
  - 列表页只需要 name/description/scene/tags/preview 几个字段，却加载了全量数据
  - 详情页只需要一个主题的完整数据，却要加载所有主题的全量 JSON 来 find 一条
- 同时 SKILL.md Phase 1 场景识别也只需要 scene/tags/description，不应读全量索引

## 约束与原则
- 列表页只加载轻量索引（themes-summary.json）
- 详情页只加载单个主题全量数据（themes/{id}.json）
- themes-summary.json 保留列表页渲染 fallback 预览所需的主色信息（primaryColor/secondaryColor/accentColor）
- 原 themes-index.json 废弃，不再生成

## 阶段与 TODO
- [x] 构建脚本：生成 themes-summary.json + themes/{id}.json，不再生成 themes-index.json
- [x] app.js：列表页改为 fetch themes-summary.json
- [x] detail.js：详情页改为 fetch themes/{id}.json，只加载单个主题全量数据

## 关键风险
- themes-summary.json 中主色字段命名（primaryColor 等）需要与 app.js 渲染逻辑对齐
- detail.json 的 URL 路径（themes/{id}.json）需要与 detail.html 的 ?theme= 参数格式对齐

## 当前进展
- 所有改动已完成

## 代码变更

### scripts/build-index.js — 新增 summary + detail 生成，废弃 themes-index.json

```diff
   themes.sort((a, b) => a.name.localeCompare(b.name));
 
-  const output = {
-    generatedAt: new Date().toISOString(),
-    themes,
-  };
-
-  const outputPath = path.join(DOCS_DIR, 'themes-index.json');
-  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + '\n');
+  /* ========== 生成 themes-summary.json（轻量索引，供列表页和 AI 场景识别） ========== */
+  const summary = themes.map(t => ({
+    dir: t.dir,
+    id: t.id || t.dir,
+    name: t.name,
+    version: t.version,
+    description: t.description,
+    author: t.author,
+    scene: t.scene,
+    tags: t.tags,
+    requires: t.requires,
+    previews: t.previews,
+    primaryColor: t.tokens?.color?.primary || '#6366f1',
+    secondaryColor: t.tokens?.color?.secondary || '#818cf8',
+    accentColor: t.tokens?.color?.accent || '#a78bfa',
+    patternPages: (t.patterns?.pages || []).map(p => p.name),
+    patternComponents: (t.patterns?.components || []).map(p => p.name),
+  }));
+
+  const summaryOutput = {
+    generatedAt: new Date().toISOString(),
+    themes: summary,
+  };
+  const summaryPath = path.join(DOCS_DIR, 'themes-summary.json');
+  fs.writeFileSync(summaryPath, JSON.stringify(summaryOutput, null, 2) + '\n');
+
+  /* ========== 生成各主题 detail.json（单主题全量数据，供详情页按需加载） ========== */
+  const DETAILS_DIR = path.join(DOCS_DIR, 'themes');
+  if (fs.existsSync(DETAILS_DIR)) fs.rmSync(DETAILS_DIR, { recursive: true });
+  fs.mkdirSync(DETAILS_DIR, { recursive: true });
+
+  for (const theme of themes) {
+    const themeId = theme.id || theme.dir;
+    const detailPath = path.join(DETAILS_DIR, `${themeId}.json`);
+    fs.writeFileSync(detailPath, JSON.stringify(theme, null, 2) + '\n');
+  }
 
   console.log(`\n✅ 已生成索引：${themes.length} 个主题，${totalPatterns} 个 Pattern 预览`);
-  console.log(`   输出: ${outputPath}`);
+  console.log(`   轻量索引: ${summaryPath}`);
+  console.log(`   详情索引: ${DETAILS_DIR}/`);
```

### docs/app.js — 列表页改为读 summary，用扁平主色字段

```diff
   const state = {
-    themes: [],          /* 全量主题数据 */
+    themes: [],          /* 轻量主题数据（来自 themes-summary.json） */
   };

-      const res = await fetch('./themes-index.json');
+      const res = await fetch('./themes-summary.json');

-    const colors = theme.tokens?.color || {};
-    const primary = colors.primary || '#6366f1';
-    const secondary = colors.secondary || '#818cf8';
-    const accent = colors.accent || '#a78bfa';
+    const primary = theme.primaryColor || '#6366f1';
+    const secondary = theme.secondaryColor || '#818cf8';
+    const accent = theme.accentColor || '#a78bfa';
```

### docs/detail.js — 详情页改为按需加载单主题 detail.json

```diff
     let theme;
     try {
-      const res = await fetch('./themes-index.json');
-      if (!res.ok) throw new Error(`HTTP ${res.status}`);
-      const data = await res.json();
-      theme = (data.themes || []).find(t => t.dir === themeName || t.name === themeName);
+      const res = await fetch(`./themes/${encodeURIComponent(themeName)}.json`);
+      if (!res.ok) throw new Error(`HTTP ${res.status}`);
+      theme = await res.json();
     } catch (err) {
```

## 测试用例
### TC-001 列表页加载轻量索引
- 类型：功能测试
- 优先级：高
- 操作步骤：运行 `node scripts/build-index.js`，打开 docs/index.html
- 预期结果：卡片包含名称、描述、场景、标签、主色预览，无报错
- 是否通过：待验证

### TC-002 详情页按需加载
- 类型：功能测试
- 优先级：高
- 操作步骤：点击卡片"查看详情"
- 预期结果：详情页展示完整 tokens + patterns，浏览器 Network 面板只请求了一个 themes/{id}.json
- 是否通过：待验证

### TC-003 summary 文件体积对比
- 类型：性能测试
- 优先级：中
- 操作步骤：对比 themes-summary.json 与原 themes-index.json 的文件大小
- 预期结果：summary 体积约为原文件的 5-10%
- 是否通过：待验证
