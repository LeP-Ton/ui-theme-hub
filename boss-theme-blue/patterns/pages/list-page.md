# 列表页模板

## 页面结构

```
┌─────────────────────────────────────────────┐
│ 面包屑                                       │
├─────────────────────────────────────────────┤
│ 页面标题                         新建 按钮   │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ 筛选区                                  │ │
│ │ [搜索框] [状态下拉] [类型下拉]         │ │
│ │ 查询  重置              展开 ▼          │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 统计卡片（可选）                        │ │
│ │ [总数] [进行中] [已完成] [已取消]      │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 表格区                                  │ │
│ │ ☐ | 名称 | 类型 | 状态 | 时间 | 操作  │ │
│ │ ── | ── | ── | ── | ── | ──          │ │
│ │                                     分页 │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## 必备组件

- `PageContainer`（或自定义面包屑 + 标题）
- `Card`：各区域容器
- `Form`：筛选条件（`layout="inline"`）
- `Table`：数据展示
- `Space`：按钮组
- `Button`：操作按钮
- `Tag`：状态展示
- `Dropdown`：更多操作

## 代码结构骨架

```tsx
import React, { useState, useCallback } from 'react';
import { Card, Table, Form, Input, Select, Button, Space, Tag, Dropdown, message, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { PaginationProps } from 'antd';

interface EntityRecord {
  id: string | number;
  // 业务字段
  status: string;
  createdAt: string;
}

const EntityListPage: React.FC = () => {
  const [searchForm] = Form.useForm();

  // 数据状态
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<EntityRecord[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 搜索参数
  const [searchParams, setSearchParams] = useState<Record<string, any>>({});

  // 数据请求
  const fetchData = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      // 请求接口
      // const res = await api.getList({ ...searchParams, ...params });
      // setDataSource(res.list);
      // setPagination(prev => ({ ...prev, total: res.total }));
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // 查询
  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    setSearchParams(values);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData({ ...values, current: 1 });
  };

  // 重置
  const handleReset = () => {
    searchForm.resetFields();
    setSearchParams({});
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData({ current: 1 });
  };

  // 删除
  const handleDelete = (record: EntityRecord) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除「${record.id}」吗？此操作不可恢复。`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        // await api.delete(record.id);
        message.success('删除成功');
        fetchData();
      },
    });
  };

  // 表格列定义
  const columns: ColumnsType<EntityRecord> = [
    // { title: '名称', dataIndex: 'name', fixed: 'left' },
    // { title: '状态', dataIndex: 'status', render: (status) => <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag> },
    // { title: '创建时间', dataIndex: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small">编辑</Button>
          <Button type="link" danger size="small" onClick={() => handleDelete(record)}>删除</Button>
        </Space>
      ),
    },
  ];

  // 分页配置
  const paginationConfig: PaginationProps = {
    ...pagination,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`,
    onChange: (current, pageSize) => {
      setPagination(prev => ({ ...prev, current, pageSize }));
      fetchData({ current, pageSize });
    },
  };

  return (
    <div style={{ padding: 'var(--content-padding, 24px)' }}>
      {/* 筛选区 */}
      <Card style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="inline">
          <Form.Item name="keyword">
            <Input placeholder="请输入关键词" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="status">
            <Select placeholder="请选择状态" allowClear style={{ width: 150 }} options={[]} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" onClick={handleSearch}>查询</Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 表格区 */}
      <Card>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          pagination={paginationConfig}
          rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
};

export default EntityListPage;
```
