# 校验逻辑统一：name/dir 唯一性收入 validateTheme

## 背景与目标
- 之前 name 重复和 dir 重复在 main 循环中单独检测，与 validateTheme 的 errors/warnings 体系脱节
- 重构为 validateTheme 统一管理所有校验，main 中只消费结果

## 约束与原则
- 所有校验逻辑集中在 validateTheme 函数内
- 跨主题唯一性检测通过 validationContext 上下文传递
- 校验通过后才更新 validationContext（避免不合格主题污染上下文）

## 阶段与 TODO
- [x] 新增 validationContext 对象（seenDirs + seenNames）
- [x] validateTheme 增加唯一性强校验
- [x] main 中删除散装的 seenDirs/seenNames 检测逻辑
- [x] 校验通过后统一更新 validationContext
- [x] 构建验证通过

## 代码变更

### scripts/build-index.js

新增 validationContext 对象：
```diff
+ const validationContext = {
+   seenDirs: new Set(),      /* dir 集合，检测目录名重复 */
+   seenNames: new Map(),     /* name → dir，检测 name 重复 */
+ };
```

validateTheme 增加唯一性强校验：
```diff
+   /* ===== 强校验：唯一性 ===== */
+   if (validationContext.seenDirs.has(dirName)) {
+     errors.push(`目录名重复: ${dirName}`);
+   }
+   if (themeData.name && typeof themeData.name === 'string') {
+     if (validationContext.seenNames.has(themeData.name)) {
+       errors.push(`name 重复: "${themeData.name}" 与 ${validationContext.seenNames.get(themeData.name)} 冲突`);
+     }
+   }
```

main 中删除散装逻辑，统一消费校验结果 + 校验通过后更新上下文：
```diff
-   /* 目录名唯一性 */
-   if (seenDirs.has(entry.name)) { ... continue; }
-   seenDirs.add(entry.name);
-
    const themeData = JSON.parse(...);
-
-   /* 格式校验 */
-   const validation = validateTheme(themeData, entry.name);
+   /* 统一校验：格式 + 唯一性 */
+   const validation = validateTheme(themeData, entry.name);
    if (validation.errors.length > 0) { ... continue; }
    if (validation.warnings.length > 0) { ... }
-
-   /* name 唯一性校验 */
-   if (themeData.name) {
-     if (seenNames.has(themeData.name)) { ... continue; }
-     seenNames.set(themeData.name, entry.name);
-   }
+
+   /* 校验通过，更新唯一性上下文 */
+   validationContext.seenDirs.add(entry.name);
+   if (themeData.name) {
+     validationContext.seenNames.set(themeData.name, entry.name);
+   }
```

## 校验分级总览

### 强校验（errors — 阻止入库）
| 校验项 | 说明 |
|--------|------|
| 必填字段缺失 | name/version/description/author/scene/tags |
| 字段类型不匹配 | name/version/scene 必须字符串，tags/requires 必须数组 |
| 目录名重复 | 同一目录下不可能同名，防御性编程 |
| name 重复 | 两个主题显示名冲突，前端展示混淆 |

### 弱校验（warnings — 允许入库）
| 校验项 | 说明 |
|--------|------|
| id 废弃字段 | 提醒删除，不影响功能 |
| tokens 缺失 | 详情页无令牌展示，列表页色彩 fallback |
| tokens 子项缺失 | spacing/typography 等 |
| patterns 空目录 | 无预览内容 |
| scene 未映射 | 前端显示英文原始值 |

## 测试用例

### TC-001 name 重复统一校验
- 操作：创建 name="企业蓝" 的重复主题
- 预期：`🚫 主题 dup-theme 校验失败: ✗ name 重复: "企业蓝" 与 boss-theme-blue 冲突`
- 是否通过：✅

### TC-002 必填缺失统一校验
- 操作：创建只有 version 的 theme.json
- 预期：`🚫 主题 bad-theme 校验失败: ✗ 缺少必填字段: name` ...
- 是否通过：✅

### TC-003 正常构建无干扰
- 操作：4 个合法主题构建
- 预期：正常通过，无 errors/warnings
- 是否通过：✅
