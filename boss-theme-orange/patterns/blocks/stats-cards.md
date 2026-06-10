# 统计卡片区模板

## 结构

```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ 📊 总数  │ │ ⏳ 进行中│ │ ✅ 已完成│ │ 📈 增长  │
│  1,128   │ │   326    │ │   678    │ │  12.5%↑  │
│ 较昨日 +8 │ │ 较昨日 -2│ │ 较昨日 +5│ │          │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

## 代码骨架

```tsx
import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface StatItem {
  title: string;
  value: number;
  prefix?: React.ReactNode;
  suffix?: string;
  precision?: number;
  trend?: {
    value: number;
    label?: string;
  };
}

interface StatsCardsProps {
  items: StatItem[];
  colSpan?: number; // 每个卡片的栅格数，默认 6（4列）
}

const StatsCards: React.FC<StatsCardsProps> = ({ items, colSpan = 6 }) => {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      {items.map((item, index) => (
        <Col key={index} xs={12} sm={12} md={colSpan}>
          <Card>
            <Statistic
              title={item.title}
              value={item.value}
              precision={item.precision}
              prefix={item.prefix}
              suffix={item.suffix}
            />
            {item.trend && (
              <div style={{ marginTop: 8, fontSize: 12 }}>
                <span style={{ color: item.trend.value >= 0 ? '#3f8600' : '#cf1322' }}>
                  {item.trend.value >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {' '}{Math.abs(item.trend.value)}%
                </span>
                <span style={{ color: '#999', marginLeft: 4 }}>
                  {item.trend.label ?? '较上期'}
                </span>
              </div>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default StatsCards;
```

## 使用示例

```tsx
const stats = [
  { title: '总数', value: 1128, prefix: <TeamOutlined />, trend: { value: 8.2, label: '较昨日' } },
  { title: '进行中', value: 326, prefix: <ClockCircleOutlined />, trend: { value: -2.1, label: '较昨日' } },
  { title: '已完成', value: 678, prefix: <CheckCircleOutlined />, trend: { value: 5.3, label: '较昨日' } },
  { title: '增长率', value: 12.5, precision: 1, suffix: '%', prefix: <RiseOutlined /> },
];

<StatsCards items={stats} />
```

## 使用规范

- 卡片数量建议 2-4 个（2/3/4 列）
- 标题 4 字以内
- 数值使用千分位分隔
- 增长趋势：绿色↑ 下降，红色↓ 下降
- 可选配置：图标前缀、单位后缀、精度
