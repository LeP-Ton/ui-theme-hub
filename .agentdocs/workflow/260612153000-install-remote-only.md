# 安装脚本修正：数据源为远程仓库，不依赖本地仓库

## 问题
之前脚本优先检测本地 ui-theme-hub 仓库做本地复制，但 ui-theme-hub 是远程主题仓库，
用户安装时本机不会有这个仓库。本地复制只是开发时的巧合，不该作为核心策略。

## 修正
- 删除本地仓库检测（findLocalRepo）和本地复制（copyThemeFromLocal）逻辑
- 唯一数据源：GitHub 仓库
- 用 raw.githubusercontent.com 获取索引和文件（无限流）
- 用 GitHub API 补充 standards/assets 等目录（有速率限制，限流时降级为只下载核心文件）
- 为 fetchUrl 添加超时（15s）和重试（2次）机制，避免网络卡住时进程挂死

## 文件下载策略
1. 从 themes-index.json 的 patterns 字段提取已知文件列表（theme.json + patterns/*.tsx）
2. 尝试 GitHub API 补充 standards/、assets/ 等目录
3. API 限流时降级为只下载已知文件（核心文件已足够使用）
4. 所有文件用 raw URL 下载，不受 API 限流

## 测试结果
```bash
$ npx ui-theme-hub install boss-theme-blue

🔍 自动搜索 ui-design-skill...
   ✓ 找到: .../ui-design-skill/themes
📦 获取主题索引...
⬇️  安装主题: boss-theme-blue
   ℹ GitHub API 限流，仅下载核心文件
   theme.json ... ✓
   patterns/pages/dashboard.tsx ... ✓
   patterns/components/stats-cards.tsx ... ✓
   ✓ 格式校验通过
✅ 已安装
```
