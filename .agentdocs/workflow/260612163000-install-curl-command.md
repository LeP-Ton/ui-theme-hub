# 安装命令修正：npx → curl 一行命令

## 问题
`npx ui-theme-hub install apple-theme` 跑不通：
- ui-theme-hub 是 private 包，没发布到 npm
- 用户本地也没有这个仓库
- npx 无法从 npm 找到包，命令直接报错

之前本地测试能跑是因为直接 `node scripts/install.js`，用的是本地文件。

## 修正
安装命令改为 curl 一行命令，从 GitHub raw URL 下载脚本临时执行：

```bash
curl -sL https://raw.githubusercontent.com/LeP-Ton/ui-theme-hub/main/scripts/install.js | node - install apple-theme
```

这样：
- 不需要 npm 发布
- 不需要 clone 仓库
- 不需要预安装任何东西
- 只要有 curl + node（开发者标配）

## 代码变更

### docs/app.js
```diff
- const cmd = `npx ui-theme-hub install ${themeId}`;
+ const cmd = `curl -sL https://raw.githubusercontent.com/LeP-Ton/ui-theme-hub/main/scripts/install.js | node - install ${themeId}`;
```

### docs/detail.js
```diff
- const cmd = `npx ui-theme-hub install ${themeId}`;
+ const cmd = `curl -sL https://raw.githubusercontent.com/LeP-Ton/ui-theme-hub/main/scripts/install.js | node - install ${themeId}`;
```

### scripts/install.js
- 更新帮助文档中的用法示例
