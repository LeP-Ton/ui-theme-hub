/**
 * Boss 蓝色主题 - 仪表盘页面
 * 典型企业级管理后台首页，含统计卡片 + 数据表格
 * 使用 boss-theme-blue tokens：primary=#1677ff, sidebarBg=#001529
 */
import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <div style={styles.layout}>
      {/* 侧边栏 */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarLogo}>Boss Admin</div>
        <nav style={styles.sidebarNav}>
          {['仪表盘', '用户管理', '订单中心', '数据报表', '系统设置'].map((item, i) => (
            <a
              key={i}
              style={i === 0 ? { ...styles.sidebarItem, ...styles.sidebarItemActive } : styles.sidebarItem}
            >
              {item}
            </a>
          ))}
        </nav>
      </aside>

      {/* 主内容区 */}
      <div style={styles.main}>
        {/* 顶栏 */}
        <header style={styles.header}>
          <span style={styles.headerTitle}>工作台</span>
          <div style={styles.headerRight}>
            <span style={styles.headerUser}>管理员</span>
          </div>
        </header>

        {/* 统计卡片 */}
        <div style={styles.statsGrid}>
          {[
            { label: '今日订单', value: '1,280', trend: '+12.5%' },
            { label: '活跃用户', value: '8,642', trend: '+5.2%' },
            { label: '总收入', value: '¥128,560', trend: '+8.1%' },
            { label: '转化率', value: '3.6%', trend: '+0.3%' },
          ].map((s, i) => (
            <div key={i} style={styles.statCard}>
              <div style={styles.statLabel}>{s.label}</div>
              <div style={styles.statValue}>{s.value}</div>
              <div style={styles.statTrend}>{s.trend}</div>
            </div>
          ))}
        </div>

        {/* 数据表格 */}
        <div style={styles.tableCard}>
          <h3 style={styles.tableTitle}>最近订单</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                {['订单号', '客户', '金额', '状态', '时间'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'ORD-2026001', name: '张三', amount: '¥1,200', status: '已完成', time: '10:30' },
                { id: 'ORD-2026002', name: '李四', amount: '¥3,450', status: '处理中', time: '11:15' },
                { id: 'ORD-2026003', name: '王五', amount: '¥890', status: '已完成', time: '14:22' },
                { id: 'ORD-2026004', name: '赵六', amount: '¥2,100', status: '待支付', time: '16:05' },
              ].map((row, i) => (
                <tr key={i} style={i % 2 === 1 ? styles.trStripe : undefined}>
                  <td style={styles.td}>{row.id}</td>
                  <td style={styles.td}>{row.name}</td>
                  <td style={styles.td}>{row.amount}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      ...(row.status === '已完成' ? styles.statusDone :
                          row.status === '处理中' ? styles.statusProcessing :
                          styles.statusPending),
                    }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={styles.td}>{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  layout: {
    display: 'flex',
    height: '100vh',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans', sans-serif",
    fontSize: 14,
    background: '#f5f5f5',
  },
  sidebar: {
    width: 240,
    background: '#001529',
    color: 'rgba(255, 255, 255, 0.65)',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  sidebarLogo: {
    height: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    fontWeight: 700,
    color: '#ffffff',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  sidebarNav: {
    padding: '8px 0',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  sidebarItem: {
    display: 'block',
    padding: '10px 24px',
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 14,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  sidebarItemActive: {
    background: '#1677ff',
    color: '#ffffff',
  },
  main: {
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    height: 56,
    background: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    borderBottom: '1px solid #f0f0f0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: 'rgba(0, 0, 0, 0.88)',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
  },
  headerUser: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.65)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    padding: 24,
  },
  statCard: {
    background: '#ffffff',
    borderRadius: 6,
    padding: '20px 24px',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.45)',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 700,
    color: 'rgba(0, 0, 0, 0.88)',
    marginBottom: 4,
  },
  statTrend: {
    fontSize: 13,
    color: '#52c41a',
  },
  tableCard: {
    margin: '0 24px 24px',
    background: '#ffffff',
    borderRadius: 6,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    overflow: 'hidden',
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: 600,
    padding: '16px 24px',
    borderBottom: '1px solid #f0f0f0',
    color: 'rgba(0, 0, 0, 0.88)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  th: {
    textAlign: 'left' as const,
    padding: '12px 16px',
    fontSize: 13,
    fontWeight: 600,
    color: 'rgba(0, 0, 0, 0.65)',
    background: '#fafafa',
    borderBottom: '1px solid #f0f0f0',
  },
  td: {
    padding: '12px 16px',
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.88)',
    borderBottom: '1px solid #f0f0f0',
  },
  trStripe: {
    background: 'rgba(0, 0, 0, 0.02)',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 500,
  },
  statusDone: {
    background: '#f6ffed',
    color: '#52c41a',
    border: '1px solid #b7eb8f',
  },
  statusProcessing: {
    background: '#e6f7ff',
    color: '#1677ff',
    border: '1px solid #91caff',
  },
  statusPending: {
    background: '#fffbe6',
    color: '#faad14',
    border: '1px solid #ffe58f',
  },
};

export default DashboardPage;
