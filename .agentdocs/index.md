# AgentDocs 索引

## 当前变更文档
`workflow/20260723223800-extract-ai-ppt-theme.md` - 提炼 ai-ppt 项目为一个 PPT 主题（AI 演示稿，scene=presentation）
`workflow/20260722143646-readme-full-rewrite.md` - README 全面重写
`workflow/20260722120352-themes-dir-migration.md` - 主题目录迁移到 themes/ 子目录（排除法→包含法）
`workflow/20260722102604-unify-validation-context.md` - 校验逻辑统一：name/dir 唯一性收入 validateTheme
`workflow/20260720174034-scene-labels-data-driven.md` - scene 中文映射从硬编码改为数据驱动
`workflow/20260720164155-unify-theme-id-name-validation.md` - 统一主题标识：删除 id 字段，name 改中文，新增构建校验
`workflow/20260706154000-split-index-two-layer.md` - themes-index.json 拆为两层：轻量索引 + 按需详情
`workflow/260622172639-download-btn-style.md` - 下载按钮样式调整：纯文字风格 + 详情页同行右侧
`workflow/260622164427-install-command-mac-entry.md` - 移除安装脚本，改为纯下载模式
`workflow/260622100000-install-download-package.md` - 安装方式改为下载安装包（.command/.bat 双击即装）
`workflow/260616090000-install-zip-approach.md` - 安装脚本：zip 下载方案 + github.com 域名
`workflow/260612163000-install-curl-command.md` - 安装命令修正：npx → curl（raw URL 方案已废弃）
`workflow/260612153000-install-remote-only.md` - 安装脚本修正：数据源为远程仓库（之前的 npx 命令已废弃）
`workflow/260612143000-install-auto-detect.md` - 安装脚本升级：自动定位 skill 目录（本地仓库部分已废弃）
`workflow/260612110000-install-script-and-btn.md` - 主题安装脚本 + 页面安装按钮
`workflow/260612100000-theme-id-url-params.md` - 主题 ID + URL 参数：已下载标记与筛选回填
`workflow/260611213000-import-driven-css.md` - CSS 注入改为 import 驱动，删除 requires.style 机制
`workflow/260611211500-require-style-css-inject.md` - 通用 CSS 注入机制 + Boss 主题使用 antd 组件（已废弃，被上一条替代）
`workflow/260611201700-pattern-tsx-preview.md` - Pattern 系统重构：.tsx 模板 + 预览/源码模式切换
`workflow/20260611155456-add-detail-page.md` - 新增主题详情页，展示完整 tokens 可视化
`workflow/20260610110046-rename-examples-blocks.md` - 目录命名优化：examples→preview，blocks→components
`workflow/20260610164800-add-github-pages.md` - 新增 GitHub Pages 可视化页面，支持按 scene/tag 筛选和搜索
