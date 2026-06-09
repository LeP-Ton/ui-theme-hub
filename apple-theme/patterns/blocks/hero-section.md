# C端 Hero 区块模板

## 结构

```
┌─────────────────────────────────────────┐
│                                         │
│         大标题（3xl-4xl）               │
│         副标题描述                       │
│         [主CTA] [次CTA]                 │
│                                         │
│         产品截图/插画                    │
│                                         │
└─────────────────────────────────────────┘
```

## 代码骨架

```tsx
<section className="hero" style={{
  minHeight: '60vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: 'var(--spacing-16) var(--spacing-4)',
}}>
  <h1 style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 700, lineHeight: 'var(--line-height-tight)' }}>
    一句话说明产品价值
  </h1>
  <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-secondary)', maxWidth: 600, marginTop: 'var(--spacing-4)' }}>
    补充说明产品价值主张
  </p>
  <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-8)' }}>
    <button className="btn btn-primary btn-lg">免费开始</button>
    <button className="btn btn-outline btn-lg">了解更多</button>
  </div>
  <div style={{ marginTop: 'var(--spacing-12)', maxWidth: '100%' }}>
    {/* 产品截图或插画 */}
  </div>
</section>
```
