# 仪表盘模板

## 页面结构

```
┌─────────────────────────────────────────────┐
│ 面包屑                                       │
├─────────────────────────────────────────────┤
│ 数据概览                        日期筛选 ▼   │
├─────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│ │ 总数 │ │进行中│ │已完成│ │ 增长 │        │
│ │ 1128 │ │ 326  │ │ 678  │ │ 12%↑ │        │
│ └──────┘ └──────┘ └──────┘ └──────┘        │
│                                             │
│ ┌─────────────────────┐ ┌─────────────────┐ │
│ │ 趋势图              │ │ 分类统计        │ │
│ │                     │ │                 │ │
│ │                     │ │                 │ │
│ └─────────────────────┘ └─────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 最近动态 / 待办事项                     │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## 必备组件

- `Card`：区域容器
- `Statistic`：统计数值
- `Row` + `Col`：栅格布局
- `DatePicker.RangePicker`（可选）：日期筛选
- 图表组件（如 `@ant-design/charts` 或自定义）
- `Table`（可选）：最近数据
- `List`（可选）：动态/待办

## 代码结构骨架

```tsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Table, List, Tag, Spin } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface DashboardData {
  total: number;
  processing: number;
  completed: number;
  growth: number;
  trend: { date: string; value: number }[];
  categoryStats: { name: string; count: number }[];
  recentItems: any[];
}

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [dateRange, setDateRange] = useState<[any, any]>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const res = await api.getDashboard({ dateRange });
        // setData(res);
      } catch (error) {
        // 错误处理
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

  if (loading) return <Spin size="large" />;

  return (
    <div style={{ padding: 'var(--content-padding, 24px)' }}>
      {/* 顶部筛选 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>数据概览</h2>
        <DatePicker.RangePicker onChange={(dates) => setDateRange(dates as any)} />
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic title="总数" value={data?.total ?? 0} />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic title="进行中" value={data?.processing ?? 0} />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic title="已完成" value={data?.completed ?? 0} />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="增长率"
              value={data?.growth ?? 0}
              precision={1}
              prefix={data && data.growth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              suffix="%"
              valueStyle={{ color: data && data.growth >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="趋势图">
            {/* 图表组件：使用 @ant-design/charts 或自定义 */}
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
              趋势图区域
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="分类统计">
            {/* 饼图或柱状图 */}
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
              分类统计区域
            </div>
          </Card>
        </Col>
      </Row>

      {/* 最近动态 */}
      <Card title="最近动态">
        <List
          dataSource={data?.recentItems ?? []}
          renderItem={(item) => (
            <List.Item>
              {/* 动态项渲染 */}
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default DashboardPage;
```
