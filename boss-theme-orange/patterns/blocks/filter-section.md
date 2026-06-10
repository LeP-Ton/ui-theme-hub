# 筛选区模板

## 结构

```
┌───────────────────────────────────────────────┐
│ [搜索框] [下拉1] [下拉2]  查询  重置  展开▼  │
│ ── 展开区域（可选）──                          │
│ [日期范围] [下拉3] [下拉4]                    │
└───────────────────────────────────────────────┘
```

## 代码骨架

```tsx
import React, { useState } from 'react';
import { Card, Form, Input, Select, DatePicker, Button, Space, Row, Col } from 'antd';

interface FilterValues {
  keyword?: string;
  status?: string;
  type?: string;
  dateRange?: [any, any];
}

interface FilterSectionProps {
  onSearch: (values: FilterValues) => void;
  onReset: () => void;
  fields?: {
    keyword?: boolean;
    status?: { options: { label: string; value: string }[] };
    type?: { options: { label: string; value: string }[] };
    dateRange?: boolean;
  };
}

const FilterSection: React.FC<FilterSectionProps> = ({ onSearch, onReset, fields }) => {
  const [form] = Form.useForm();
  const [expanded, setExpanded] = useState(false);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    onSearch(values);
  };

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  return (
    <Card style={{ marginBottom: 16 }}>
      <Form form={form} layout="inline">
        {/* 常驻条件 */}
        <Form.Item name="keyword">
          <Input placeholder="请输入关键词" allowClear style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name="status">
          <Select placeholder="请选择状态" allowClear style={{ width: 150 }} options={fields?.status?.options ?? []} />
        </Form.Item>

        {/* 展开条件 */}
        {expanded && (
          <>
            <Form.Item name="type">
              <Select placeholder="请选择类型" allowClear style={{ width: 150 }} options={fields?.type?.options ?? []} />
            </Form.Item>
            <Form.Item name="dateRange">
              <DatePicker.RangePicker />
            </Form.Item>
          </>
        )}

        {/* 操作按钮 */}
        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSearch}>查询</Button>
            <Button onClick={handleReset}>重置</Button>
            <Button type="link" onClick={() => setExpanded(!expanded)}>
              {expanded ? '收起' : '展开'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default FilterSection;
```

## 使用规范

- 筛选条件 <= 3 个：全部展示，无需展开/收起
- 筛选条件 > 3 个：前 3 个常驻，其余收起
- 搜索触发方式：点击"查询"按钮，非实时搜索
- 重置：清空所有条件并触发查询
