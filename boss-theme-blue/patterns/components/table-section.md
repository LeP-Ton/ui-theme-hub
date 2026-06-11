# 表格区模板

## 结构

```
┌───────────────────────────────────────────────┐
│ 批量操作栏（已选 N 项）[批量删除] [批量导出] │
├───────────────────────────────────────────────┤
│ ☐ | 名称 | 类型 | 状态 | 时间 | 操作        │
│ ──| ──── | ── | ─── | ── | ──              │
│                                              │
│                         共 X 条  < 1 2 3 >   │
└───────────────────────────────────────────────┘
```

## 代码骨架

```tsx
import React, { useState } from 'react';
import { Card, Table, Button, Space, Dropdown, message, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { PaginationProps } from 'antd';

interface TableSectionProps<T extends { id: string | number }> {
  columns: ColumnsType<T>;
  dataSource: T[];
  loading?: boolean;
  total?: number;
  onPaginationChange?: (current: number, pageSize: number) => void;
  onDelete?: (id: T['id']) => void;
  onBatchDelete?: (ids: React.Key[]) => void;
  rowSelection?: object;
}

function TableSection<T extends { id: string | number }>({
  columns,
  dataSource,
  loading = false,
  total = 0,
  onPaginationChange,
  onDelete,
  onBatchDelete,
}: TableSectionProps<T>) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 单条删除
  const handleDelete = (record: T) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除吗？此操作不可恢复。`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => onDelete?.(record.id),
    });
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的项');
      return;
    }
    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 项吗？`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        onBatchDelete?.(selectedRowKeys);
        setSelectedRowKeys([]);
      },
    });
  };

  const paginationConfig: PaginationProps = {
    total,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (t) => `共 ${t} 条`,
    onChange: onPaginationChange,
  };

  return (
    <Card>
      {/* 批量操作栏 */}
      {selectedRowKeys.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Space>
            <span>已选择 {selectedRowKeys.length} 项</span>
            <Button danger size="small" onClick={handleBatchDelete}>批量删除</Button>
            <Button size="small" onClick={() => setSelectedRowKeys([])}>取消选择</Button>
          </Space>
        </div>
      )}

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={paginationConfig}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        scroll={{ x: 'max-content' }}
      />
    </Card>
  );
}

export default TableSection;
```

## 使用规范

- 表格必须配置 `rowKey`
- 大数据量时开启 `scroll={{ x: 'max-content' }}`
- 操作列固定右侧
- 超过 3 个操作使用 Dropdown
- 分页默认展示总数、页码跳转、条数切换
