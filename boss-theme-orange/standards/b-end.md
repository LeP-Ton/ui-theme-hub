# B端管理系统专属规范

## 布局

### 标准三栏布局

```
┌──────────────────────────────────────────┐
│ Header（固定顶部，56px）                  │
├──────┬───────────────────────────────────┤
│      │ 面包屑                             │
│ Side ├───────────────────────────────────┤
│ bar  │ 页面标题               操作按钮   │
│ 240px├───────────────────────────────────┤
│ 折叠 │ 内容区域（padding: 24px）          │
│ 80px │                                   │
└──────┴───────────────────────────────────┘
```

- 侧边栏：默认 240px，可折叠至 80px
- 内容区最小高度：calc(100vh - 56px)

### 推荐技术栈：antd 5.x

## 表格规范

- 表头背景：`color.background.muted`
- 行高：54px
- 关键列固定左侧，操作列固定右侧
- 超过 3 个操作使用下拉菜单
- 分页：默认每页 10 条，显示总数和页码跳转

## 表单规范

- 水平表单（搜索）：`layout="inline"`，antd Form
- 栅格表单（新增/编辑）：两列 `Row + Col`，labelCol 6 / wrapperCol 18
- 超过 3 行条件使用"展开/收起"

## 反馈规范

- 成功/失败：`message.success()` / `message.error()`
- 重要通知：`notification`
- 确认操作：`Modal.confirm()`
- 危险操作必须二次确认

## 页面类型

| 页面 | 特征 | 详见 |
|------|------|------|
| 列表页 | 搜索+表格+分页 | `templates/scenes/b-end/pages/list-page.md` |
| 详情页 | 信息展示+操作 | `templates/scenes/b-end/pages/detail-page.md` |
| 表单页 | 新增/编辑 | `templates/scenes/b-end/pages/form-page.md` |
| 仪表盘 | 统计+图表 | `templates/scenes/b-end/pages/dashboard.md` |
