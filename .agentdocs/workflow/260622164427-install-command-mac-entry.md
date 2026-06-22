# 移除安装脚本，改为纯下载模式

## 背景与目标
- 之前 zip 包内含 install.sh / install.command / install.bat / README.txt，用户解压后运行安装脚本自动安装。
- 但 macOS 双击 .sh 默认用文本编辑器打开，.command 需要 Gatekeeper 授权，安装体验差。
- 决定移除所有安装脚本，zip 只打包主题目录，用户自行放置到目标位置。

## 方案
- zip 包仅包含主题目录（{themeId}/），不含任何安装脚本和 README
- 前端按钮提示改为"下载"，toast 提示改为"解压后放置到目标目录即可"
- 删除 scripts/install.js（curl 安装脚本）
- 删除 build-index.js 中 generateMacInstaller / generateMacCommandWrapper / generateWinInstaller / generateReadme 四个函数
- 删除 package.json 中 bin 和 install-theme script

## 阶段与 TODO
- [x] 移除 build-index.js 中安装脚本生成和写入逻辑
- [x] 移除四个安装脚本生成函数
- [x] 删除 scripts/install.js
- [x] 清理 package.json（bin、install-theme script）
- [x] 前端按钮文案改为下载
- [x] 下载文件名保留时间戳避免 Finder 括号
- [x] build 验证

## 当前进展
- 全部完成，build 验证通过。

## 代码变更
- scripts/build-index.js（移除安装脚本生成逻辑和四个函数）
```diff
-    /* 生成 install.sh（macOS/Linux） */
-    fs.writeFileSync(path.join(tmpDir, 'install.sh'), generateMacInstaller(themeId, theme.name));
-    fs.chmodSync(path.join(tmpDir, 'install.sh'), 0o755);
-
-    /* 生成 install.command（macOS 双击入口） */
-    fs.writeFileSync(path.join(tmpDir, 'install.command'), generateMacCommandWrapper());
-    fs.chmodSync(path.join(tmpDir, 'install.command'), 0o755);
-
-    /* 生成 install.bat（Windows） */
-    fs.writeFileSync(path.join(tmpDir, 'install.bat'), generateWinInstaller(themeId, theme.name));
-
-    /* 生成 README.txt */
-    fs.writeFileSync(path.join(tmpDir, 'README.txt'), generateReadme(themeId, theme.name));
```

```diff
-    /* 准备临时打包目录：{themeId}/ + install 脚本 */
+    /* 准备临时打包目录：仅主题目录，用户自行放置 */
```

```diff
-  console.log(`\n✅ 已生成 ${themes.length} 个安装包 → ${PACKAGES_DIR}`);
+  console.log(`\n✅ 已生成 ${themes.length} 个主题包 → ${PACKAGES_DIR}`);
```

（四个函数 generateMacInstaller / generateMacCommandWrapper / generateWinInstaller / generateReadme 整体删除，不再列出）

- scripts/install.js（整体删除）

- package.json
```diff
-  "bin": {
-    "ui-theme-hub": "./scripts/install.js"
-  },
   "scripts": {
     "build": "node scripts/build-index.js",
-    "preview": "npx http-server docs -p 3000 -c-1",
-    "install-theme": "node scripts/install.js"
+    "preview": "npx http-server docs -p 3000 -c-1"
   },
```

- docs/app.js
```diff
-    /* 安装按钮：下载 zip 安装包 */
+    /* 下载按钮：下载主题 zip 包 */
-      /* 直接下载构建好的 zip 安装包（含主题文件 + 安装脚本） */
+      /* 下载主题 zip 包，用户自行放置到目标目录 */
-      a.download = 'install-' + themeId + '-' + ts + '.zip';
+      a.download = themeId + '-' + ts + '.zip';
-      showToast('已下载安装包，解压后运行 install.sh/install.bat');
+      showToast('已下载 ' + themeId + '，解压后放置到目标目录即可');
```

- docs/detail.js
```diff
-    /* 绑定安装按钮：下载 zip 安装包 */
+    /* 绑定下载按钮：下载主题 zip 包 */
-        a.download = 'install-' + themeId + '-' + ts + '.zip';
+        a.download = themeId + '-' + ts + '.zip';
```

## 测试用例
### TC-001 下载 zip 只含主题目录
  - 类型：功能测试
  - 优先级：高
  - 前置条件：运行 npm run build
  - 操作步骤：
  1. 检查 docs/packages/apple-theme.zip 内容
  - 预期结果：
  - zip 内只有 apple-theme/ 目录及其文件
  - 无 install.sh / install.command / install.bat / README.txt
  - 是否通过：已验证
