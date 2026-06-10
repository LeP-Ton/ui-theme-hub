# 详情页模板

## 页面结构

```
┌─────────────────────────────────────────────┐
│ 道路 > 某某 > 详情                           │
├─────────────────────────────────────────────┤
│ ← 返回  页面标题             编辑 删除 按钮 │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ 基本信息                                │ │
│ │ ┌──────────┬──────────────────────────┐ │ │
│ │ │ 字段名   │ 值                       │ │ │
│ │ │ 字段名   │ 值                       │ │ │
│ │ │ 字段名   │ 值                       │ │ │
│ │ └──────────┴──────────────────────────┘ │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 关联信息（可选）                        │ │
│ │ 表格/标签列表                           │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 操作记录（可选）                        │ │
│ │ 时间线                                  │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## 必备组件

- `PageContainer` 或自定义面包屑
- `Card`：信息分组容器
- `Descriptions`：键值对信息展示
- `Button`：操作按钮
- `Tag`：状态展示
- `Timeline`（可选）：操作记录
- `Table`（可选）：关联数据

## 代码结构骨架

```tsx
import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Space, Tag, message, Modal, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';

interface DetailData {
  id: string | number;
  status: string;
  createdAt: string;
  updatedAt: string;
  // 业务字段
}

const EntityDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<DetailData | null>(null);

  // 获取详情
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        // const res = await api.getDetail(id);
        // setDetail(res);
      } catch (error) {
        message.error('获取详情失败');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  // 删除
  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除吗？此操作不可恢复。',
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        // await api.delete(id);
        message.success('删除成功');
        navigate(-1);
      },
    });
  };

  if (loading) return <Spin size="large" />;
  if (!detail) return null;

  return (
    <div style={{ padding: 'var(--content-padding, 24px)' }}>
      {/* 顶部操作栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Button onClick={() => navigate(-1)}>返回</Button>
        <Space>
          <Button type="primary">编辑</Button>
          <Button danger onClick={handleDelete}>删除</Button>
        </Space>
      </div>

      {/* 基本信息 */}
      <Card title="基本信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="名称">{/* detail.name */}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color="blue">{/* detail.status */}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">{/* detail.createdAt */}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{/* detail.updatedAt */}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 关联信息（按需） */}
      <Card title="关联信息" style={{ marginBottom: 16 }}>
        {/* Table 或其他内容 */}
      </Card>
    </div>
  );
};

export default EntityDetailPage;
```
