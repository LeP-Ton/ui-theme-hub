# 表单区模板

## 结构

```
┌───────────────────────────────────────────────┐
│ 分组标题                              [操作]  │
├───────────────────────────────────────────────┤
│ ┌──────────┬──────────────┬─────────────────┐ │
│ │ 名称 *   │ [输入框]     │                 │ │
│ │ 类型 *   │ [下拉选择]   │                 │ │
│ │ 日期     │ [日期选择]   │                 │ │
│ │ 启用     │ [开关]       │                 │ │
│ │ 描述     │ [文本域]                      │ │
│ └──────────┴──────────────┴─────────────────┘ │
└───────────────────────────────────────────────┘
```

## 代码骨架

```tsx
import React from 'react';
import {
  Card, Form, Input, Select, DatePicker, Switch,
  InputNumber, Radio, Checkbox, Row, Col,
} from 'antd';

interface FormSectionProps {
  title: string;
  extra?: React.ReactNode;
  fields: FormField[];
  columns?: 1 | 2 | 3; // 表单列数
  form?: ReturnType<typeof Form.useForm>[0];
}

interface FormField {
  name: string;
  label: string;
  type: 'input' | 'select' | 'datePicker' | 'switch' | 'inputNumber' | 'radio' | 'checkbox' | 'textArea';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string | number }[];
  rules?: any[];
  span?: number; // 占几列
  props?: Record<string, any>;
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  extra,
  fields,
  columns = 2,
}) => {
  const colSpan = 24 / columns;

  const renderField = (field: FormField) => {
    const commonProps = {
      placeholder: field.placeholder,
      ...field.props,
    };

    switch (field.type) {
      case 'input':
        return <Input {...commonProps} maxLength={50} showCount />;
      case 'textArea':
        return <Input.TextArea {...commonProps} rows={4} maxLength={500} showCount />;
      case 'select':
        return <Select {...commonProps} options={field.options} showSearch allowClear />;
      case 'datePicker':
        return <DatePicker {...commonProps} style={{ width: '100%' }} />;
      case 'inputNumber':
        return <InputNumber {...commonProps} style={{ width: '100%' }} />;
      case 'switch':
        return <Switch />;
      case 'radio':
        return <Radio.Group options={field.options} />;
      case 'checkbox':
        return <Checkbox.Group options={field.options} />;
      default:
        return <Input {...commonProps} />;
    }
  };

  return (
    <Card title={title} extra={extra} style={{ marginBottom: 16 }}>
      <Row gutter={16}>
        {fields.map((field) => (
          <Col
            key={field.name}
            xs={24}
            md={field.span ? field.span * colSpan : colSpan}
          >
            <Form.Item
              label={field.label}
              name={field.name}
              valuePropName={field.type === 'switch' ? 'checked' : 'value'}
              rules={
                field.required
                  ? [{ required: true, message: `请${field.type === 'select' ? '选择' : '输入'}${field.label}` }]
                  : field.rules
              }
            >
              {renderField(field)}
            </Form.Item>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default FormSection;
```

## 使用示例

```tsx
<Form form={form} layout="vertical" onFinish={handleSubmit}>
  <FormSection
    title="基本信息"
    fields={[
      { name: 'name', label: '名称', type: 'input', required: true },
      { name: 'type', label: '类型', type: 'select', required: true, options: [...] },
      { name: 'description', label: '描述', type: 'textArea', span: 2 },
    ]}
  />
  <FormSection
    title="高级设置"
    fields={[
      { name: 'enabled', label: '启用', type: 'switch' },
      { name: 'priority', label: '优先级', type: 'inputNumber' },
    ]}
  />
</Form>
```

## 使用规范

- 表单分组：每张 Card 一个逻辑分组
- 列数选择：字段 <= 3 用单列，4-8 用两列，> 8 用三列
- 必填项：字段名后自动加 `*`，校验消息格式统一
- 长文本：使用 `textArea` 类型，占整行（span: 2）
- 开关类型：`valuePropName` 设为 `checked`
