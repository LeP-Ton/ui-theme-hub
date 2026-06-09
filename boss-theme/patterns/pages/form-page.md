# 表单页模板

## 页面结构

```
┌─────────────────────────────────────────────┐
│ 面包屑                                       │
├─────────────────────────────────────────────┤
│ ← 返回  新建/编辑 XXX                        │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ 基本信息                                │ │
│ │ ┌──────────┬──────────────────────────┐ │ │
│ │ │ 名称 *   │ [输入框]                 │ │ │
│ │ │ 类型 *   │ [下拉选择]               │ │ │
│ │ │ 描述     │ [文本域]                 │ │ │
│ │ └──────────┴──────────────────────────┘ │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 其他信息（可选分组）                    │ │
│ │ ...                                     │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│                    [取消]  [提交]            │
└─────────────────────────────────────────────┘
```

## 必备组件

- `PageContainer` 或自定义面包屑
- `Card`：表单分组容器
- `Form`：表单
- `Input` / `Input.TextArea`：文本输入
- `Select`：下拉选择
- `DatePicker`：日期选择
- `Switch`：开关
- `Radio.Group`：单选
- `Checkbox.Group`：多选
- `Button`：提交/取消
- `Row` + `Col`：栅格布局

## 代码结构骨架

```tsx
import React, { useEffect } from 'react';
import {
  Card, Form, Input, Select, DatePicker, Switch,
  Button, Space, Row, Col, message,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';

interface FormValues {
  name: string;
  type: string;
  description?: string;
  // 业务字段
}

const EntityFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const isEdit = Boolean(id);

  // 编辑模式：加载数据
  useEffect(() => {
    if (isEdit && id) {
      const fetchDetail = async () => {
        try {
          // const res = await api.getDetail(id);
          // form.setFieldsValue(res);
        } catch (error) {
          message.error('获取数据失败');
        }
      };
      fetchDetail();
    }
  }, [id, isEdit, form]);

  // 提交
  const handleSubmit = async (values: FormValues) => {
    try {
      if (isEdit) {
        // await api.update(id, values);
        message.success('更新成功');
      } else {
        // await api.create(values);
        message.success('创建成功');
      }
      navigate(-1);
    } catch (error) {
      message.error(isEdit ? '更新失败' : '创建失败');
    }
  };

  return (
    <div style={{ padding: 'var(--content-padding, 24px)' }}>
      {/* 顶部操作栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Button onClick={() => navigate(-1)}>返回</Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        {/* 基本信息 */}
        <Card title="基本信息" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="名称"
                name="name"
                rules={[{ required: true, message: '请输入名称' }]}
              >
                <Input placeholder="请输入名称" maxLength={50} showCount />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="类型"
                name="type"
                rules={[{ required: true, message: '请选择类型' }]}
              >
                <Select placeholder="请选择类型" options={[]} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="描述" name="description">
                <Input.TextArea placeholder="请输入描述" rows={4} maxLength={500} showCount />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 底部操作 */}
        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={() => navigate(-1)}>取消</Button>
            <Button type="primary" htmlType="submit">
              {isEdit ? '保存' : '创建'}
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default EntityFormPage;
```
