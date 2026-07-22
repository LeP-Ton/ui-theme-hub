# README 全面重写

## 背景与目标
- 原 README 严重过时：主题名称旧版（boss-theme/apple-theme/game-theme）、安装方式已废弃、字段规范指向外部链接
- 将历史会话中的所有改动成果统一写进 README：标识体系、场景配置、校验规则、URL 参数、目录结构、下载机制

## 内容覆盖

| 章节 | 内容 |
|------|------|
| 主题一览 | 4 个主题的 dir/name/scene/主色/patterns 表格 |
| 项目结构 | 根目录 + themes/ + docs/ 完整树形图 |
| 主题目录规范 | 每个 must/optional 字段的标注 |
| theme.json 规范 | 字段表 + 标识体系说明 + tokens 完整结构 + 示例 JSON |
| 场景配置 | theme.config.json 维护方式 + 工作流程 + 新增场景步骤 |
| 构建与校验 | 构建流程 7 步 + 强校验/弱校验分级表格 |
| URL 参数 | scene/tags/q/installed 参数说明 + 组合示例 |
| 下载机制 | zip 包格式 + 解压使用方式 |
| 贡献指南 | 6 步流程 + .tsx 开发注意事项 |
| 技术栈 | 前端/构建/部署/CI 表格 |

## 代码变更

### README.md 完整重写
- 从 56 行扩充至 ~230 行
- 删除旧版内容：旧主题名、cp 复制安装方式、外部 SKILL.md 引用
- 新增：所有上述章节
