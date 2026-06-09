# UI Theme Hub

统一主题仓库，为 [ui-design-skill](https://github.com/LeP-Ton/ui-design-skill.git) 提供所有可用主题。

## 主题列表

| 名称 | 场景 | 描述 | 技术栈 |
|------|------|------|--------|
| boss-theme | B端管理 | 专业科技感，适合企业级应用 | antd |
| apple-theme | C端/营销/移动 | Apple 风格，简洁优雅 | Tailwind CSS |
| game-theme | 游戏 | 暗色沉浸，适合游戏界面 | 原生 CSS + poem |

## 主题结构

每个主题目录包含：

```
{theme-name}/
├── theme.json              # 必需：介绍页 + tokens
├── patterns/               # 可选：页面/区块模板
│   ├── pages/
│   └── blocks/
├── standards/              # 可选：场景专属设计规范
├── assets/                 # 可选：物料素材
│   ├── icons/
│   ├── illustrations/
│   └── fragments/
└── examples/               # 可选：预览截图（.png/.webp）
```

## 安装方式

将需要的主题目录复制到项目的 `themes/` 目录即可：

```bash
# 复制单个主题
cp -r boss-theme/ /your-project/themes/

# 或 clone 整个仓库后按需使用
git clone https://github.com/example/ui-theme-hub.git
```

## 贡献新主题

1. 在本仓库中创建新的主题目录
2. 添加 theme.json（必需字段：name、version、scene、tokens）
3. 添加 patterns/、standards/、examples/ 等
4. 提交 PR

## theme.json 必需字段

详见 [ui-design-skill SKILL.md](https://github.com/example/ui-design-skill/blob/main/SKILL.md) 中的规范定义。

## 许可证

MIT