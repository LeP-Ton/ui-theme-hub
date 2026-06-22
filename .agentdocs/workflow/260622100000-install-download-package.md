# 安装方式改为下载真实安装包（zip）

## 背景与目标
- 原方案：点击"安装"按钮 → 复制 curl 命令 → 粘贴到终端执行。UX 门槛高，且下载的只是引导脚本，运行后还需联网再下载主题文件。
- 新方案：点击"下载安装包" → 下载 zip 文件（内含主题文件 + 安装脚本） → 解压 → 双击安装脚本 → 自动查找 ui-design-skill 目录并安装。
- 核心：安装包是**自包含**的，离线也能安装，无需联网再下载。

## 约束与原则
- 安装包自包含：zip 内含主题目录 + install.sh + install.bat + README.txt
- 离线安装：解压后双击脚本即可，无需 curl/node 联网下载
- 构建时生成：build-index.js 为每个主题打包 zip，输出到 docs/packages/
- 前端直接下载：点击按钮直接下载 zip，不再浏览器端生成脚本

## 流程
```
构建时：build-index.js → 为每个主题生成 {themeId}.zip → docs/packages/

用户流程：
  点击"下载安装包"
  → 浏览器下载 install-{themeId}.zip
  → 解压
  → macOS: 双击 install.sh / Windows: 双击 install.bat
  → 脚本自动查找 ui-design-skill/themes/ 目录
  → 复制主题目录 → 安装完成
```

## 阶段与 TODO
- [x] 构建脚本新增安装包打包逻辑（build-index.js）
- [x] 前端列表页安装按钮改为直接下载 zip
- [x] 前端详情页安装按钮改为直接下载 zip
- [x] 删除旧的浏览器端脚本生成函数（generateMacScript / generateWinScript / downloadInstaller）
- [x] 按钮样式调整（white-space: nowrap）

## 代码变更

### scripts/build-index.js

- 新增 `child_process.execSync` 引用（用于调用 zip 命令）
- 主流程末尾新增安装包生成逻辑：
  - 为每个主题创建临时目录，包含 {themeId}/ 主题文件 + install.sh + install.bat + README.txt
  - 排除 previews 目录（安装后不需要）
  - 用系统 zip 命令打 zip 包，输出到 docs/packages/{themeId}.zip
- 新增函数 `generateMacInstaller(themeId, themeName)`：生成 zip 内的 install.sh（自动查找 ui-design-skill/themes、复制主题目录）
- 新增函数 `generateWinInstaller(themeId, themeName)`：生成 zip 内的 install.bat（同上）
- 新增函数 `generateReadme(themeId, themeName)`：生成 zip 内的 README.txt

```diff
 const fs = require('fs');
 const path = require('path');
+const { execSync } = require('child_process');
 const esbuild = require('esbuild');
```

### docs/app.js

- 删除 generateMacScript / generateWinScript / downloadInstaller 函数
- 安装按钮点击事件改为直接下载 zip：
```diff
-    /* 安装按钮：下载安装包（macOS .command / Windows .bat） */
+    /* 安装按钮：下载 zip 安装包 */
     $grid.addEventListener('click', (e) => {
       const btn = e.target.closest('.card-install-btn');
       if (!btn) return;

       e.stopPropagation();
-      downloadInstaller(btn.dataset.themeId);
+      const themeId = btn.dataset.themeId;
+      const a = document.createElement('a');
+      a.href = 'packages/' + themeId + '.zip';
+      a.download = 'install-' + themeId + '.zip';
+      a.click();
+      showToast('已下载 install-' + themeId + '.zip，解压后运行 install.sh/install.bat');
     });
```

- 按钮文字和 title：
```diff
-              <button class="card-install-btn" data-theme-id="${escapeHTML(themeId)}" title="复制安装命令">安装</button>
+              <button class="card-install-btn" data-theme-id="${escapeHTML(themeId)}" title="下载安装包">下载安装包</button>
```

### docs/detail.js

- 删除 generateMacScript / generateWinScript / downloadInstaller 函数
- 安装按钮点击事件改为直接下载 zip：
```diff
-    /* 绑定安装按钮：下载安装包 */
+    /* 绑定安装按钮：下载 zip 安装包 */
     $main.querySelectorAll('.detail-install-btn').forEach(btn => {
       btn.addEventListener('click', () => {
-        downloadInstaller(btn.dataset.themeId);
+        const themeId = btn.dataset.themeId;
+        const a = document.createElement('a');
+        a.href = 'packages/' + themeId + '.zip';
+        a.download = 'install-' + themeId + '.zip';
+        a.click();
       });
     });
```

- 按钮文字：
```diff
-            <button class="detail-install-btn" data-theme-id="${escapeHTML(theme.id || theme.dir)}">复制安装命令</button>
+            <button class="detail-install-btn" data-theme-id="${escapeHTML(theme.id || theme.dir)}">下载安装包</button>
```

### docs/style.css

```diff
 .card-install-btn {
   font-size: 12px;
   padding: 3px 10px;
   border-radius: 6px;
   border: 1px solid var(--accent);
   background: transparent;
   color: var(--accent);
   cursor: pointer;
   font-weight: 500;
+  white-space: nowrap;
   transition: all 0.15s;
 }
```

### docs/detail.css

```diff
 .detail-install-btn {
   ...
+  white-space: nowrap;
   transition: all 0.15s;
 }
```

## 测试用例

### TC-001 下载 zip 安装包
- 类型：功能测试
- 优先级：高
- 关联模块：app.js 安装按钮
- 前置条件：已执行 `npm run build` 生成安装包
- 操作步骤：
  1. 打开列表页，点击任意主题的"下载安装包"
  2. 确认浏览器下载了 `install-{themeId}.zip` 文件
  3. 解压 zip，确认内含 {themeId}/ 目录 + install.sh + install.bat + README.txt
- 预期结果：zip 内容完整，主题文件和安装脚本都存在
- 是否通过：待验证

### TC-002 macOS 安装
- 类型：功能测试
- 优先级：高
- 操作步骤：
  1. 解压 zip，运行 `bash install.sh`
  2. 确认脚本自动找到 ui-design-skill/themes/ 目录
  3. 确认主题目录被复制到 ui-design-skill/themes/{themeId}/
- 预期结果：主题安装成功
- 是否通过：待验证

### TC-003 Windows 安装
- 类型：功能测试
- 优先级：高
- 操作步骤：
  1. 解压 zip，双击 install.bat
  2. 确认主题目录被复制到 ui-design-skill/themes/{themeId}/
- 预期结果：主题安装成功
- 是否通过：待验证

### TC-004 详情页下载一致
- 类型：功能测试
- 优先级：中
- 操作步骤：
  1. 打开详情页，点击"下载安装包"
  2. 确认下载行为与列表页一致
- 是否通过：待验证
