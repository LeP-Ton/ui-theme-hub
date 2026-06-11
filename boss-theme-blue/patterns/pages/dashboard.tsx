/**
 * Boss 蓝色主题 - 仪表盘页面
 * 典型企业级管理后台首页，含统计卡片 + 数据表格
 * 使用 antd 组件 + boss-theme-blue tokens：primary=#1677ff, sidebarBg=#001529
 */
import React from 'react';
import 'antd/dist/antd.min.css';
import { Layout, Menu, Card, Statistic, Table, Tag, Avatar } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Sider, Header, Content } = Layout;

/* 侧边栏菜单项 */
const menuItems = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: 'users', icon: <UserOutlined />, label: '用户管理' },
  { key: 'orders', icon: <ShoppingCartOutlined />, label: '订单中心' },
  { key: 'reports', icon: <BarChartOutlined />, label: '数据报表' },
  { key: 'settings', icon: <SettingOutlined />, label: '系统设置' },
];

/* 统计卡片数据 */
const stats = [
  { title: '今日订单', value: 1280, suffix: '单', trend: 12.5 },
  { title: '活跃用户', value: 8642, suffix: '人', trend: 5.2 },
  { title: '总收入', value: 128560, prefix: '¥', trend: 8.1 },
  { title: '转化率', value: 3.6, suffix: '%', trend: 0.3 },
];

/* 表格列定义 */
const columns = [
  { title: '订单号', dataIndex: 'id', key: 'id' },
  { title: '客户', dataIndex: 'name', key: 'name' },
  { title: '金额', dataIndex: 'amount', key: 'amount' },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => {
      const colorMap: Record<string, string> = { '已完成': 'green', '处理中': 'blue', '待支付': 'orange' };
      return <Tag color={colorMap[status]}>{status}</Tag>;
    },
  },
  { title: '时间', dataIndex: 'time', key: 'time' },
];

/* 表格数据 */
const data = [
  { key: '1', id: 'ORD-2026001', name: '张三', amount: '¥1,200', status: '已完成', time: '10:30' },
  { key: '2', id: 'ORD-2026002', name: '李四', amount: '¥3,450', status: '处理中', time: '11:15' },
  { key: '3', id: 'ORD-2026003', name: '王五', amount: '¥890', status: '已完成', time: '14:22' },
  { key: '4', id: 'ORD-2026004', name: '赵六', amount: '¥2,100', status: '待支付', time: '16:05' },
];

const DashboardPage: React.FC = () => {
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
          Boss Admin
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
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
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>工作台</span>
          <Avatar icon={<UserOutlined />} />
        </Header>

        {/* 主内容 */}
        <Content style={{ padding: 24, background: '#f5f5f5' }}>
          {/* 统计卡片 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {stats.map((s, i) => (
              <Card key={i} size="small">
                <Statistic
                  title={s.title}
                  value={s.value}
                  prefix={s.prefix}
                  suffix={s.suffix}
                  valueStyle={{ color: i < 3 ? '#1677ff' : '#faad14', fontSize: 24 }}
                />
              </Card>
            ))}
          </div>

          {/* 数据表格 */}
          <Card title="最近订单" size="small">
            <Table
              columns={columns}
              dataSource={data}
              pagination={false}
              size="small"
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardPage;
