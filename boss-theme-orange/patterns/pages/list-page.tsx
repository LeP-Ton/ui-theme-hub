/**
 * Boss 橙色主题 - 列表页
 * 典型企业级列表页，含筛选区 + 数据表格 + 分页
 * 使用 boss-theme-orange tokens：primary=#ff6600, sidebarActiveBg=#ff6600
 */
import React from 'react';

const ListPage: React.FC = () => {
  return (
    <div style={styles.layout}>
      {/* 侧边栏 */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarLogo}>Boss Pro</div>
        <nav style={styles.sidebarNav}>
          {['数据总览', '业务管理', '订单列表', '客户中心', '配置中心'].map((item, i) => (
            <a
              key={i}
              style={i === 2 ? { ...styles.sidebarItem, ...styles.sidebarItemActive } : styles.sidebarItem}
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
          <span style={styles.breadcrumb}>业务管理 / 订单列表</span>
        </header>

        {/* 筛选区 */}
        <div style={styles.filterBar}>
          <input style={styles.searchInput} placeholder="搜索订单号 / 客户名" />
          <select style={styles.select}>
            <option>全部状态</option>
            <option>已完成</option>
            <option>处理中</option>
            <option>待支付</option>
          </select>
          <button style={styles.searchBtn}>查询</button>
          <button style={styles.resetBtn}>重置</button>
        </div>

        {/* 数据表格 */}
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['订单号', '客户', '商品', '金额', '状态', '创建时间'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'BZ-20260001', name: '陈一', product: '企业套餐A', amount: '¥5,800', status: '已完成', time: '2026-06-10' },
                { id: 'BZ-20260002', name: '刘二', product: '专业版', amount: '¥1,200', status: '处理中', time: '2026-06-10' },
                { id: 'BZ-20260003', name: '张三', product: '基础版', amount: '¥360', status: '待支付', time: '2026-06-09' },
                { id: 'BZ-20260004', name: '李四', product: '企业套餐B', amount: '¥12,000', status: '已完成', time: '2026-06-09' },
                { id: 'BZ-20260005', name: '王五', product: '专业版', amount: '¥1,200', status: '已完成', time: '2026-06-08' },
              ].map((row, i) => (
                <tr key={i} style={i % 2 === 1 ? styles.trStripe : undefined}>
                  <td style={styles.td}><a style={styles.link}>{row.id}</a></td>
                  <td style={styles.td}>{row.name}</td>
                  <td style={styles.td}>{row.product}</td>
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
          {/* 分页 */}
          <div style={styles.pagination}>
            <span style={styles.pageInfo}>共 128 条</span>
            <div style={styles.pageButtons}>
              {['<', '1', '2', '3', '>'].map((p, i) => (
                <button key={i} style={i === 1 ? { ...styles.pageBtn, ...styles.pageBtnActive } : styles.pageBtn}>
                  {p}
                </button>
              ))}
            </div>
          </div>
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
  sidebarNav: { padding: '8px 0' },
  sidebarItem: {
    display: 'block',
    padding: '10px 24px',
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 14,
    cursor: 'pointer',
  },
  sidebarItemActive: {
    background: '#ff6600',
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
    padding: '0 24px',
    borderBottom: '1px solid #f0f0f0',
  },
  breadcrumb: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.45)',
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px 24px',
    background: '#ffffff',
    marginBottom: 16,
    borderBottom: '1px solid #f0f0f0',
  },
  searchInput: {
    padding: '6px 12px',
    borderRadius: 6,
    border: '1px solid #d9d9d9',
    fontSize: 14,
    width: 240,
    outline: 'none',
  },
  select: {
    padding: '6px 12px',
    borderRadius: 6,
    border: '1px solid #d9d9d9',
    fontSize: 14,
    background: '#ffffff',
    outline: 'none',
  },
  searchBtn: {
    padding: '6px 20px',
    borderRadius: 6,
    border: 'none',
    background: '#ff6600',
    color: '#ffffff',
    fontSize: 14,
    cursor: 'pointer',
  },
  resetBtn: {
    padding: '6px 20px',
    borderRadius: 6,
    border: '1px solid #d9d9d9',
    background: '#ffffff',
    fontSize: 14,
    cursor: 'pointer',
  },
  tableCard: {
    margin: '0 24px',
    background: '#ffffff',
    borderRadius: 6,
    overflow: 'hidden',
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
  trStripe: { background: 'rgba(0, 0, 0, 0.02)' },
  link: {
    color: '#ff6600',
    cursor: 'pointer',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 12,
  },
  statusDone: { background: '#f6ffed', color: '#52c41a', border: '1px solid #b7eb8f' },
  statusProcessing: { background: '#fff7e6', color: '#ff6600', border: '1px solid #ffd591' },
  statusPending: { background: '#fffbe6', color: '#faad14', border: '1px solid #ffe58f' },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
  },
  pageInfo: { fontSize: 13, color: 'rgba(0, 0, 0, 0.45)' },
  pageButtons: { display: 'flex', gap: 4 },
  pageBtn: {
    padding: '4px 10px',
    borderRadius: 4,
    border: '1px solid #d9d9d9',
    background: '#ffffff',
    fontSize: 13,
    cursor: 'pointer',
  },
  pageBtnActive: {
    background: '#ff6600',
    color: '#ffffff',
    borderColor: '#ff6600',
  },
};

export default ListPage;
