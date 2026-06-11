/**
 * Boss 橙色主题 - 表单区块组件
 * 含输入框、选择器、按钮的标准表单，使用 antd Form 组件
 * 使用 boss-theme-orange tokens：primary=#ff6600
 */
import React from 'react';
import { Card, Form, Input, Select, Button } from 'antd';

interface FormSectionProps {
  title?: string;
}

const FormSection: React.FC<FormSectionProps> = ({ title = '新建项目' }) => {
  return (
    <Card title={title} style={{ maxWidth: 720 }}>
      <Form
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        layout="horizontal"
      >
        <Form.Item label="项目名称" name="name" rules={[{ required: true, message: '请输入项目名称' }]}>
          <Input placeholder="请输入项目名称" />
        </Form.Item>

        <Form.Item label="所属部门" name="department" rules={[{ required: true, message: '请选择部门' }]}>
          <Select placeholder="请选择">
            <Select.Option value="tech">技术部</Select.Option>
            <Select.Option value="product">产品部</Select.Option>
            <Select.Option value="design">设计部</Select.Option>
            <Select.Option value="ops">运营部</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="负责人" name="owner">
          <Input placeholder="请输入负责人姓名" />
        </Form.Item>

        <Form.Item label="优先级" name="priority">
          <Select placeholder="请选择">
            <Select.Option value="low">低</Select.Option>
            <Select.Option value="medium">中</Select.Option>
            <Select.Option value="high">高</Select.Option>
            <Select.Option value="urgent">紧急</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="备注说明" name="remark">
          <Input.TextArea rows={3} placeholder="请输入备注信息" />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
          <Button type="primary" htmlType="submit" style={{ marginRight: 12 }}>
            提交
          </Button>
          <Button>取消</Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default FormSection;
