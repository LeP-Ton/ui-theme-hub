# 主题目录迁移到 themes/ 子目录

## 背景与目标
- 旧版主题散在项目根目录，构建脚本用排除法识别主题（`if ['docs','scripts','node_modules',...].includes(...) continue`）
- 每新增非主题目录都得改排除列表，逻辑脆弱
- 改为包含法：themes/ 下含 theme.json 的子目录即为主题，根目录只放项目骨架

## 约束与原则
- 所有主题目录移入 `themes/`
- 构建脚本扫描 `THEMES_DIR` 而非根目录，删除排除列表
- 产物路径（docs/ 内的预览图、pattern HTML、zip 等）不变，对前端零影响
- GitHub Actions 的 `**/theme.json` 通配符天然覆盖新路径

## 阶段与 TODO
- [x] 移动 4 个主题目录到 themes/
- [x] build-index.js：THEMES_DIR 定义提前到 validateTheme 前
- [x] build-index.js：扫描 THEMES_DIR 替代扫描根目录 + 删排除列表
- [x] build-index.js：所有 `path.join(REPO_ROOT, entry.name)` → `path.join(THEMES_DIR, entry.name)`
- [x] build-index.js：zip 打包路径 `path.join(REPO_ROOT, theme.dir)` → `path.join(THEMES_DIR, theme.dir)`
- [x] 清理根目录残留测试目录（ppt-theme）
- [x] 构建验证通过
- [x] 更新 AGENTS.md 目录结构

## 代码变更

### 目录迁移
```
apple-theme/        → themes/apple-theme/
boss-theme-blue/    → themes/boss-theme-blue/
boss-theme-orange/  → themes/boss-theme-orange/
cyberpunk-theme/    → themes/cyberpunk-theme/
```

### scripts/build-index.js

新增 THEMES_DIR 常量（移到 validateTheme 前，与 CONFIG_PATH 同级）：
```diff
+ /* ========== 主题源目录与配置 ========== */
+ const THEMES_DIR = path.join(REPO_ROOT, 'themes');
+ const CONFIG_PATH = path.join(REPO_ROOT, 'theme.config.json');
+ ...
- /* ========== 加载全局配置 ========== */
- const CONFIG_PATH = ...
```

扫描逻辑改为包含法：
```diff
- const entries = fs.readdirSync(REPO_ROOT, { withFileTypes: true });
+ const entries = fs.readdirSync(THEMES_DIR, { withFileTypes: true });
```

删除排除列表：
```diff
-   if (['docs', 'scripts', 'node_modules', '.tmp-build'].includes(entry.name)) continue;
```

所有主题路径拼接改为 THEMES_DIR：
```diff
-   const themeJsonPath = path.join(REPO_ROOT, entry.name, 'theme.json');
+   const themeJsonPath = path.join(THEMES_DIR, entry.name, 'theme.json');
-   const previewDir = path.join(REPO_ROOT, entry.name, 'previews');
+   const previewDir = path.join(THEMES_DIR, entry.name, 'previews');
-   { key: 'pages', dir: path.join(REPO_ROOT, entry.name, 'patterns', 'pages') },
+   { key: 'pages', dir: path.join(THEMES_DIR, entry.name, 'patterns', 'pages') },
-   const patternsDir = path.join(REPO_ROOT, dirName, 'patterns');
+   const patternsDir = path.join(THEMES_DIR, dirName, 'patterns');
-   const themeDir = path.join(REPO_ROOT, theme.dir);
+   const themeDir = path.join(THEMES_DIR, theme.dir);
```

### 根目录清理
```
删除 ppt-theme/（残留测试目录）
```

### 前端文件（无改动）
- app.js / detail.js 中无硬编码主题目录路径，仅引用 docs/ 下的产物路径，不受影响

### .github/workflows/pages.yml（无改动）
- `**/theme.json` 通配符天然覆盖 themes/ 子目录

## 测试用例

### TC-001 构建产物路径不变
- 操作：运行构建，检查 docs/ 下的产物
- 预期：theme-previews、pattern-previews、themes/*.json、packages/*.zip 路径与迁移前一致
- 是否通过：✅

### TC-002 根目录无主题目录残留
- 操作：ls 根目录
- 预期：只有 AGENTS.md, README.md, docs, package.json, scripts, theme.config.json, themes
- 是否通过：✅

### TC-003 新增非主题目录不被扫描
- 操作：在根目录建 `tools/` 目录（无 theme.json）
- 预期：构建正常，tools/ 不被当作主题扫描（包含法天然跳过）
- 是否通过：逻辑验证 ✅（THEMES_DIR 不包含 tools/）
