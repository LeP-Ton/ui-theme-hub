/**
 * Boss 橙色主题 - 列表页
 * 典型企业级列表页，含筛选区 + 数据表格 + 分页
 * 使用 antd 组件 + boss-theme-orange tokens：primary=#ff6600, sidebarActiveBg=#ff6600
 */
import React from 'react';
import 'antd/dist/antd.min.css';
import { Layout, Menu, Breadcrumb, Input, Select, Button, Table, Tag, Pagination } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  TeamOutlined,
  ToolOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

const { Sider, Header, Content } = Layout;

/* 侧边栏菜单项 */
const menuItems = [
  { key: 'overview', icon: <DashboardOutlined />, label: '数据总览' },
  { key: 'business', icon: <AppstoreOutlined />, label: '业务管理' },
  { key: 'orders', icon: <UnorderedListOutlined />, label: '订单列表' },
  { key: 'customers', icon: <TeamOutlined />, label: '客户中心' },
  { key: 'config', icon: <ToolOutlined />, label: '配置中心' },
];

/* 表格列定义 */
const columns = [
  { title: '订单号', dataIndex: 'id', key: 'id', render: (v: string) => <a style={{ color: '#ff6600' }}>{v}</a> },
  { title: '客户', dataIndex: 'name', key: 'name' },
  { title: '商品', dataIndex: 'product', key: 'product' },
  { title: '金额', dataIndex: 'amount', key: 'amount' },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => {
      const colorMap: Record<string, string> = { '已完成': 'green', '处理中': 'orange', '待支付': 'gold' };
      return <Tag color={colorMap[status]}>{status}</Tag>;
    },
  },
  { title: '创建时间', dataIndex: 'time', key: 'time' },
];

/* 表格数据 */
const data = [
  { key: '1', id: 'BZ-20260001', name: '陈一', product: '企业套餐A', amount: '¥5,800', status: '已完成', time: '2026-06-10' },
  { key: '2', id: 'BZ-20260002', name: '刘二', product: '专业版', amount: '¥1,200', status: '处理中', time: '2026-06-10' },
  { key: '3', id: 'BZ-20260003', name: '张三', product: '基础版', amount: '¥360', status: '待支付', time: '2026-06-09' },
  { key: '4', id: 'BZ-20260004', name: '李四', product: '企业套餐B', amount: '¥12,000', status: '已完成', time: '2026-06-09' },
  { key: '5', id: 'BZ-20260005', name: '王五', product: '专业版', amount: '¥1,200', status: '已完成', time: '2026-06-08' },
];

const ListPage: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider width={240} theme="dark">
        <div style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 18,
          fontWeight: 700,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          Boss Pro
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['orders']}
          items={menuItems}
        />
      </Sider>

      <Layout>
        {/* 顶栏 */}
        <Header style={{
          background: '#ffffff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <Breadcrumb
            items={[
              { title: '业务管理' },
              { title: '订单列表' },
            ]}
          />
        </Header>

        <Content style={{ padding: 24, background: '#f5f5f5' }}>
          {/* 筛选区 */}
          <div style={{
            background: '#ffffff',
            padding: 16,
            marginBottom: 16,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <Input.Search
              placeholder="搜索订单号 / 客户名"
              style={{ width: 280 }}
            />
            <Select
              defaultValue="all"
              style={{ width: 140 }}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'done', label: '已完成' },
                { value: 'processing', label: '处理中' },
                { value: 'pending', label: '待支付' },
              ]}
            />
            <Button type="primary" icon={<SearchOutlined />}>
              查询
            </Button>
            <Button icon={<ReloadOutlined />}>重置</Button>
          </div>

          {/* 数据表格 */}
          <div style={{ background: '#ffffff', borderRadius: 6 }}>
            <Table
              columns={columns}
              dataSource={data}
              size="middle"
              pagination={{
                total: 128,
                pageSize: 10,
                showTotal: (total) => `共 ${total} 条`,
              }}
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ListPage;
