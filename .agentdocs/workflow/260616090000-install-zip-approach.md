# 安装脚本：zip 下载方案 + github.com 域名

## 问题
1. `raw.githubusercontent.com` 在国内不可达，curl 命令跑不通
2. 逐文件下载依赖 raw URL 或 GitHub API，两者都有问题（前者墙了，后者限流）

## 方案
改为下载仓库 zip 包再解压：
- 下载 URL：`https://github.com/LeP-Ton/ui-theme-hub/archive/refs/heads/main.zip`
- 走 `github.com` 域名，国内可达，无限流
- 用系统 `unzip` 命令解压，从解压结果中提取指定主题目录
- 临时目录用后自动清理

## 安装命令
```bash
curl -sL https://github.com/LeP-Ton/ui-theme-hub/raw/main/scripts/install.js | node - install apple-theme
```

注意：这个 URL 也走 `github.com` 域名（GitHub 会 302 重定向到 CDN），不依赖 `raw.githubusercontent.com`

## 实测
```bash
$ node scripts/install.js install boss-theme-blue

📦 下载主题仓库...
   ✓ 下载完成 (14840 KB)
📂 解压...
   ✓ 解压完成
⬇️  安装主题: boss-theme-blue
   ✓ 文件复制完成
   ✓ 格式校验通过
✅ 已安装
```

## 相比之前的优势
| | 逐文件下载 (raw URL) | zip 包下载 (github.com) |
|---|---|---|
| 域名 | raw.githubusercontent.com | github.com |
| 国内可达 | ❌ | ✅ |
| 限流 | GitHub API 限流 | 无 |
| 完整性 | API 限流时只下载核心文件 | 完整目录含 standards/assets |
| 速度 | 多次网络请求 | 一次下载 |
