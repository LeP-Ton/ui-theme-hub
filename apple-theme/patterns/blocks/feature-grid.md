# C端特性网格区块模板

## 结构

```
┌─────────────────────────────────────────┐
│ 标题：核心特性                           │
│ 副标题：一句话概括                       │
├─────────────────────────────────────────┤
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐            │
│ │图标│ │图标│ │图标│ │图标│            │
│ │标题│ │标题│ │标题│ │标题│            │
│ │描述│ │描述│ │描述│ │描述│            │
│ └────┘ └────┘ └────┘ └────┘            │
└─────────────────────────────────────────┘
```

## 代码骨架

```tsx
const features = [
  { icon: '🚀', title: '高性能', desc: '毫秒级响应...' },
  { icon: '🔒', title: '安全可靠', desc: '企业级安全...' },
  { icon: '📱', title: '全平台', desc: '一次开发...' },
  { icon: '🔧', title: '易扩展', desc: '插件化架构...' },
];

<section className="features" style={{ padding: 'var(--spacing-16) var(--spacing-4)' }}>
  <h2 style={{ textAlign: 'center' }}>核心特性</h2>
  <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>一句话概括</p>
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 'var(--spacing-6)',
    marginTop: 'var(--spacing-8)',
    maxWidth: 1200,
    marginInline: 'auto',
  }}>
    {features.map(f => (
      <div key={f.title} style={{
        padding: 'var(--spacing-6)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-bg-elevated)',
      }}>
        <span style={{ fontSize: '2rem' }}>{f.icon}</span>
        <h3 style={{ marginTop: 'var(--spacing-2)' }}>{f.title}</h3>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-1)' }}>{f.desc}</p>
      </div>
    ))}
  </div>
</section>
```
