# 统一主题标识：删除 id 字段，name 改中文，新增构建校验

## 背景与目标
- 原来主题有 `dir`、`id`、`name` 三个标识字段，实际值完全相同，造成冗余
- 统一为：`dir`（目录名）= 唯一标识，`name` = 用户可见的中文显示名
- 删除 `id` 字段，消除三字段同值的混乱
- 新增构建时格式校验 + 唯一性校验，防止不合规主题入库

## 约束与原则
- `dir` 天然唯一（文件系统保证），作为所有标识用途的锚点
- `name` 必须全局唯一，用于前端展示
- 校验分两级：errors（阻止入库）、warnings（允许入库但提示）

## 阶段与 TODO
- [x] 删除 4 个 theme.json 的 `id` 字段，`name` 改中文
- [x] build-index.js 删除所有 `id` 引用，统一用 `dir`
- [x] app.js / detail.js 删除 `id || dir` fallback，统一用 `dir`
- [x] 新增 validateTheme() 校验函数
- [x] 新增 name 唯一性校验
- [x] 新增 id 废弃字段警告
- [x] 构建验证通过

## 代码变更

### apple-theme/theme.json -1
```diff
- "id": "apple-theme",
- "name": "apple-theme",
+ "name": "Apple 风格",
```

### boss-theme-blue/theme.json -1
```diff
- "id": "boss-theme-blue",
- "name": "boss-theme-blue",
+ "name": "企业蓝",
```

### boss-theme-orange/theme.json -1
```diff
- "id": "boss-theme-orange",
- "name": "boss-theme-orange",
+ "name": "企业橙",
```

### cyberpunk-theme/theme.json -1
```diff
- "id": "cyberpunk-theme",
- "name": "cyberpunk-theme",
+ "name": "赛博朋克",
```

### scripts/build-index.js +60
```diff
+ /* ========== 主题格式校验 ========== */
+ 
+ /**
+  * 校验 theme.json 必填字段与类型
+  * 返回 { valid, errors, warnings }
+  * - errors: 严重问题，阻止该主题入库
+  * - warnings: 警告问题，允许入库但输出提示
+  */
+ function validateTheme(themeData, dirName) {
+   const errors = [];
+   const warnings = [];
+   /* 必填字段 */
+   const requiredFields = ['name', 'version', 'description', 'author', 'scene', 'tags'];
+   for (const field of requiredFields) {
+     if (themeData[field] == null) {
+       errors.push(`缺少必填字段: ${field}`);
+     }
+   }
+   /* 类型校验 */
+   ...
+   /* 已废弃字段检测 */
+   if ('id' in themeData) {
+     warnings.push('id 字段已废弃，主题标识统一使用目录名（dir），请删除 id 字段');
+   }
+   /* tokens 结构建议 */
+   ...
+   /* patterns 目录检测 */
+   ...
+   return { valid: errors.length === 0, errors, warnings };
+ }
```

```diff
  /* ========== 主流程 ========== */
  const entries = fs.readdirSync(REPO_ROOT, { withFileTypes: true });
  const themes = [];
+ /* 唯一性检测集合 */
+ const seenNames = new Map();   /* name → dir，检测 name 重复 */
+ const seenDirs = new Set();    /* dir 集合，检测目录名重复 */
```

```diff
-     const themeData = JSON.parse(fs.readFileSync(themeJsonPath, 'utf-8'));
-     console.log(`\n📦 处理主题: ${themeData.name}`);
+     /* 目录名唯一性 */
+     if (seenDirs.has(entry.name)) { ... continue; }
+     seenDirs.add(entry.name);
+ 
+     const themeData = JSON.parse(fs.readFileSync(themeJsonPath, 'utf-8'));
+ 
+     /* 格式校验 */
+     const validation = validateTheme(themeData, entry.name);
+     if (validation.errors.length > 0) { ... continue; }
+     if (validation.warnings.length > 0) { ... }
+ 
+     /* name 唯一性校验 */
+     if (themeData.name) {
+       if (seenNames.has(themeData.name)) { ... continue; }
+       seenNames.set(themeData.name, entry.name);
+     }
+ 
+     console.log(`\n📦 处理主题: ${themeData.name}`);
```

```diff
  /* summary 生成 */
-     id: t.id || t.dir,
      name: t.name,
```

```diff
  /* detail JSON 生成 */
-     const themeId = theme.id || theme.dir;
+     const themeId = theme.dir;
```

```diff
  /* zip 包生成 */
-     const themeId = theme.id || theme.dir;
+     const themeId = theme.dir;
```

### docs/app.js -3
```diff
-     const themeId = theme.id || theme.dir;
+     const themeId = theme.dir;
```
```diff
-           theme.name,
-           theme.id || theme.dir,
+           theme.name,
+           theme.dir,
```
```diff
-       const aInstalled = state.installedIds.has(a.id || a.dir) ? 0 : 1;
-       const bInstalled = state.installedIds.has(b.id || b.dir) ? 0 : 1;
+       const aInstalled = state.installedIds.has(a.dir) ? 0 : 1;
+       const bInstalled = state.installedIds.has(b.dir) ? 0 : 1;
```

### docs/detail.js -1
```diff
-             <button class="detail-install-btn" data-theme-id="${escapeHTML(theme.id || theme.dir)}">⬇ 下载主题</button>
+             <button class="detail-install-btn" data-theme-id="${escapeHTML(theme.dir)}">⬇ 下载主题</button>
```

## 测试用例

### TC-001 必填字段缺失校验
- 类型：功能测试
- 优先级：高
- 关联模块：validateTheme
- 前置条件：项目根目录存在一个 theme.json 缺少 name/description 等字段的目录
- 操作步骤：运行 `node scripts/build-index.js`
- 预期结果：输出 `🚫 主题 xxx 校验失败: ✗ 缺少必填字段: name` 等，该主题不入库
- 是否通过：✅ 已验证

### TC-002 name 重复校验
- 类型：功能测试
- 优先级：高
- 关联模块：main
- 前置条件：两个主题的 name 字段值相同
- 操作步骤：运行构建
- 预期结果：输出 `🚫 主题 name 重复: "xxx" 同时出现在 dir1 和 dir2`，后出现的主题不入库
- 是否通过：✅ 已验证

### TC-003 id 废弃警告
- 类型：功能测试
- 优先级：中
- 关联模块：validateTheme
- 前置条件：theme.json 中包含 `id` 字段
- 操作步骤：运行构建
- 预期结果：输出 `⚠ id 字段已废弃` 警告，主题仍正常入库
- 是否通过：✅ 已验证

### TC-004 正常构建产物无 id 字段
- 类型：功能测试
- 优先级：高
- 关联模块：build-index
- 前置条件：4 个合法主题
- 操作步骤：运行构建，检查 themes-summary.json 和 themes/*.json
- 预期结果：所有产物中无 `id` 字段，`name` 为中文
- 是否通过：✅ 已验证
