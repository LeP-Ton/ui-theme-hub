/**
 * Boss 蓝色主题 - 统计卡片组件
 * 4列指标展示，含标签/数值/趋势，适用于管理后台首页
 * 使用 boss-theme-blue tokens：primary=#1677ff
 */
import React from 'react';

interface StatItem {
  label: string;
  value: string;
  trend: string;
  trendType?: 'up' | 'down';
}

interface StatsCardsProps {
  items?: StatItem[];
}

const defaultItems: StatItem[] = [
  { label: '今日访客', value: '12,483', trend: '+18.2%', trendType: 'up' },
  { label: '成交金额', value: '¥89,420', trend: '+6.5%', trendType: 'up' },
  { label: '退单率', value: '2.1%', trend: '-0.8%', trendType: 'down' },
  { label: '平均响应', value: '1.2s', trend: '-15%', trendType: 'down' },
];

const StatsCards: React.FC<StatsCardsProps> = ({ items = defaultItems }) => {
  return (
    <div style={styles.grid}>
      {items.map((item, i) => (
        <div key={i} style={styles.card}>
          <div style={styles.label}>{item.label}</div>
          <div style={styles.value}>{item.value}</div>
          <div style={{
            ...styles.trend,
            color: item.trendType === 'down' ? '#ff4d4f' : '#52c41a',
          }}>
            {item.trendType === 'up' ? '↑' : '↓'} {item.trend}
          </div>
        </div>
      ))}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  card: {
    background: '#ffffff',
    borderRadius: 6,
    padding: '20px 24px',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)',
  },
  label: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.45)',
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: 700,
    color: 'rgba(0, 0, 0, 0.88)',
    marginBottom: 4,
  },
  trend: {
    fontSize: 13,
    fontWeight: 500,
  },
};

export default StatsCards;
