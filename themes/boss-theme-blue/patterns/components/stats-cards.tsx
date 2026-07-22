/**
 * Boss 蓝色主题 - 统计卡片组件
 * 4列指标展示，使用 antd Statistic 组件
 * 使用 boss-theme-blue tokens：primary=#1677ff
 */
import React from 'react';
import 'antd/dist/antd.min.css';
import { Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface StatItem {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  trend: number;
  trendDirection: 'up' | 'down';
}

interface StatsCardsProps {
  items?: StatItem[];
}

const defaultItems: StatItem[] = [
  { title: '今日访客', value: 12483, suffix: '人', trend: 18.2, trendDirection: 'up' },
  { title: '成交金额', value: 89420, prefix: '¥', trend: 6.5, trendDirection: 'up' },
  { title: '退单率', value: 2.1, suffix: '%', trend: 0.8, trendDirection: 'down' },
  { title: '平均响应', value: 1.2, suffix: 's', trend: 15, trendDirection: 'down' },
];

const StatsCards: React.FC<StatsCardsProps> = ({ items = defaultItems }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {items.map((item, i) => (
        <Card key={i} size="small">
          <Statistic
            title={item.title}
            value={item.value}
            prefix={item.prefix}
            suffix={item.suffix}
            valueStyle={{
              color: item.trendDirection === 'up' ? '#52c41a' : '#ff4d4f',
              fontSize: 24,
            }}
            prefix={item.trendDirection === 'up'
              ? <ArrowUpOutlined />
              : <ArrowDownOutlined />
            }
          />
          <div style={{ fontSize: 13, color: item.trendDirection === 'up' ? '#52c41a' : '#ff4d4f', marginTop: 4 }}>
            {item.trendDirection === 'up' ? '+' : '-'}{item.trend}%
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
