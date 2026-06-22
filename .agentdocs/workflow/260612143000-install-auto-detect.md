# 安装脚本升级：自动定位 skill 目录 + 本地仓库优先

## 背景与目标
- 之前安装脚本需要用户手动指定 --target，体验割裂
- 升级为自动搜索 ui-design-skill 的 themes 目录，一键安装
- 优先本地仓库复制（更快、无限流），降级 GitHub API 下载

## 核心改动

### 自动定位策略
1. `~/.claude/skills/ui-design` 符号链接 → 解析到真实路径/themes/
2. 常见开发目录（~/Documents/program/ui-design-skill/themes/）
3. find 命令搜索（深度5）
4. 降级到 ./themes

### 本地仓库优先
- 检测脚本所在目录的父目录是否为 ui-theme-hub 仓库
- 是：直接本地复制文件（ms 级完成）
- 否：降级 GitHub API 下载（需网络，受 API 限流）

### 安装校验
- 安装后自动校验 theme.json 格式（必需字段、tokens 6维度）
- 已安装主题自动跳过，提示覆盖方法

## 实测结果
```bash
$ npx ui-theme-hub install boss-theme-blue

🔍 自动搜索 ui-design-skill...
   ✓ 找到（Claude skills 链接）: /Users/didi/Documents/program/ui-design-skill/themes

📂 检测到本地仓库: /Users/didi/Documents/program/ui-theme-hub

⬇️  安装主题: boss-theme-blue
   ✓ 本地复制完成
   ✓ 格式校验通过
✅ 已安装: boss-theme-blue → .../ui-design-skill/themes/boss-theme-blue
```

## 代码变更

### scripts/install.js（重写核心逻辑）
```diff
+ function findSkillThemesDir() {
+   /* 策略1: ~/.claude/skills/ui-design 符号链接 */
+   /* 策略2: 常见开发目录 */
+   /* 策略3: find 搜索 */
+   /* 策略4: 降级 ./themes */
+ }

+ function findLocalRepo() {
+   /* 检测脚本所在目录的父目录是否为 ui-theme-hub 仓库 */
+ }

+ function copyThemeFromLocal(localRepo, themeId, targetDir) {
+   /* 递归复制目录，跳过 .git/node_modules */
+ }

+ function validateThemeJson(themeJson, themeId) {
+   /* 校验必需字段 + tokens 6维度 + color基础字段 */
+ }

  /* 主流程 */
+ const localRepo = findLocalRepo();
+ if (localRepo && copyThemeFromLocal(localRepo, themeId, targetDir)) {
+   /* 本地复制，ms级完成 */
+ } else {
+   /* 降级 GitHub API 下载 */
+ }
+ validateThemeJson(themeJson, themeId);
```

## 测试用例
### TC-001 自动定位 skill 目录
- `npx ui-theme-hub install apple-theme` 无 --target
- 脚本自动找到 ~/.claude/skills/ui-design → ui-design-skill/themes/

### TC-002 本地仓库优先复制
- 从 ui-theme-hub 仓库内执行
- 检测到本地仓库，直接复制，不请求 GitHub API

### TC-003 重复安装保护
- 目标目录已有 theme.json → 跳过并提示

### TC-004 格式校验
- 安装后自动校验 theme.json 必需字段和 tokens 完整性
