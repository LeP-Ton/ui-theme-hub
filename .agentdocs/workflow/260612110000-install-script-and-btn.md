# 主题安装脚本 + 页面安装按钮

## 背景与目标
- 用户需要从 Theme Hub 页面一键安装主题到本地项目
- 方案：页面点击「安装」按钮 → 复制 npx 命令到剪贴板 → 用户粘贴到终端执行

## 方案设计

### 安装脚本 scripts/install.js
- 纯 Node.js 内置模块实现（https/fs/path），零依赖
- 从 GitHub API 获取主题目录结构，逐文件下载
- 保留主题原始目录结构（patterns/standards/previews/theme.json）
- 支持多主题同时安装（逗号分隔）
- 支持自定义目标目录（--target）

### 页面安装按钮
- 首页卡片 footer 加「安装」按钮，点击复制 `npx ui-theme-hub install <id>`
- 详情页信息区加「复制安装命令」按钮
- 点击后通过 Clipboard API 复制，Toast 提示反馈

### 安装命令格式
```bash
npx ui-theme-hub install apple-theme
npx ui-theme-hub install boss-theme-blue --target ./src/themes
npx ui-theme-hub install apple-theme,boss-theme-orange
```

## 当前进展
- ✅ scripts/install.js 编写完成
- ✅ 首页卡片安装按钮 + Toast 提示
- ✅ 详情页安装按钮
- ✅ package.json 添加 bin 入口
- ✅ 实际测试安装 apple-theme 成功

## 代码变更

### scripts/install.js（新增）
```bash
#!/usr/bin/env node
# 从 GitHub 仓库下载指定主题目录
# 用法：npx ui-theme-hub install <theme-id> [--target <dir>]
```

### package.json
```diff
+ "bin": {
+   "ui-theme-hub": "./scripts/install.js"
+ },
+ "install-theme": "node scripts/install.js"
```

### docs/app.js
```diff
+ <button class="card-install-btn" data-theme-id="${escapeHTML(themeId)}">安装</button>
+ /* 安装按钮点击：复制 npx 命令 */
+ $grid.addEventListener('click', (e) => {
+   const btn = e.target.closest('.card-install-btn');
+   navigator.clipboard?.writeText(`npx ui-theme-hub install ${themeId}`);
+ });
+ function showToast(message, duration = 2500) { ... }
```

### docs/style.css
```diff
+ .card-install-btn { border: 1px solid var(--accent); color: var(--accent); }
+ .card-install-btn:hover { background: var(--accent); color: #fff; }
+ #app-toast { position: fixed; bottom: 32px; ... }
```

### docs/detail.js
```diff
+ <button class="detail-install-btn" data-theme-id="...">复制安装命令</button>
+ /* 绑定安装按钮：复制 npx 命令 */
```

### docs/detail.css
```diff
+ .detail-install-btn { border: 1px solid var(--accent); color: var(--accent); }
+ .detail-install-btn::before { content: '⬇'; }
+ .detail-install-btn:hover { background: var(--accent); color: #fff; }
```

## 测试用例
### TC-001 首页安装按钮
- 点击卡片「安装」按钮
- Toast 显示 `已复制: npx ui-theme-hub install apple-theme`
- 粘贴到终端可执行

### TC-002 详情页安装按钮
- 点击详情页「复制安装命令」
- 按钮文字变为「已复制!」，2秒后恢复
- 粘贴到终端可执行

### TC-003 安装脚本单主题
- `node scripts/install.js install apple-theme --target /tmp/test`
- 目标目录下生成 apple-theme/ 目录，含 theme.json + patterns + standards

### TC-004 安装脚本多主题
- `node scripts/install.js install apple-theme,cyberpunk-theme`
- 两个主题目录均安装成功

### TC-005 安装脚本主题不存在
- `node scripts/install.js install not-exist`
- 输出警告，不中断
