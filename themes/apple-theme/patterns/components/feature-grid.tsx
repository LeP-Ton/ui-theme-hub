/**
 * Apple 风格特性网格组件
 * 3列特性展示卡片，适用于落地页和产品介绍页
 * 使用 apple-theme tokens
 */
import React from 'react';

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

interface FeatureGridProps {
  features?: FeatureItem[];
}

const defaultFeatures: FeatureItem[] = [
  { icon: '🚀', title: '高性能', description: '极致的加载速度与响应体验' },
  { icon: '🎯', title: '精准定位', description: '智能推荐，直达用户所需' },
  { icon: '🌐', title: '全球覆盖', description: '多语言多区域无缝接入' },
  { icon: '📊', title: '数据洞察', description: '实时可视化运营数据' },
  { icon: '🤝', title: '开放生态', description: '丰富的 API 与插件市场' },
  { icon: '🛡️', title: '隐私保护', description: '端到端加密，数据自主可控' },
];

const FeatureGrid: React.FC<FeatureGridProps> = ({ features = defaultFeatures }) => {
  return (
    <div style={styles.grid}>
      {features.map((f, i) => (
        <div key={i} style={styles.card}>
          <span style={styles.icon}>{f.icon}</span>
          <h3 style={styles.title}>{f.title}</h3>
          <p style={styles.desc}>{f.description}</p>
        </div>
      ))}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
    padding: 24,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  card: {
    padding: '24px 20px',
    borderRadius: 12,
    border: '1px solid #ffe7ba',
    background: '#fffbf0',
    textAlign: 'center' as const,
    transition: 'box-shadow 0.2s',
  },
  icon: {
    fontSize: 28,
    display: 'block',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 600,
    color: 'rgba(0, 0, 0, 0.85)',
    marginBottom: 6,
  },
  desc: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.65)',
    lineHeight: 1.5,
    margin: 0,
  },
};

export default FeatureGrid;
