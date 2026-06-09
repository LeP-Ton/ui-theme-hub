# C端首页模板

## 页面结构

```
┌─────────────────────────────────────────┐
│ 导航栏（Logo + 导航链接 + CTA按钮）     │
├─────────────────────────────────────────┤
│ Hero 区                                  │
│ 大标题                                   │
│ 副标题描述                               │
│ [主CTA] [次CTA]                         │
├─────────────────────────────────────────┤
│ 信任背书（Logo 墙，可选）                │
├─────────────────────────────────────────┤
│ 特性网格（3-4 列）                       │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐            │
│ │图标│ │图标│ │图标│ │图标│            │
│ │标题│ │标题│ │标题│ │标题│            │
│ │描述│ │描述│ │描述│ │描述│            │
│ └────┘ └────┘ └────┘ └────┘            │
├─────────────────────────────────────────┤
│ 产品展示区（大图 + 描述，交替布局）      │
├─────────────────────────────────────────┤
│ 评价/案例区                              │
├─────────────────────────────────────────┤
│ 底部 CTA                                 │
│ 号召文案 + [主按钮]                     │
├─────────────────────────────────────────┤
│ 页脚                                     │
└─────────────────────────────────────────┘
```

## 代码骨架

```tsx
import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      {/* 导航栏 */}
      <header className="nav">
        <div className="nav-logo">Logo</div>
        <nav className="nav-links">...</nav>
        <div className="nav-cta">
          <button className="btn btn-primary">开始使用</button>
        </div>
      </header>

      {/* Hero 区 */}
      <section className="hero">
        <h1 className="hero-title">主标题</h1>
        <p className="hero-subtitle">副标题描述</p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg">主CTA</button>
          <button className="btn btn-outline btn-lg">次CTA</button>
        </div>
      </section>

      {/* 特性网格 */}
      <section className="features">
        <h2>核心特性</h2>
        <div className="feature-grid">
          {/* Feature cards */}
        </div>
      </section>

      {/* 产品展示 */}
      <section className="showcase">...</section>

      {/* 评价区 */}
      <section className="testimonials">...</section>

      {/* 底部 CTA */}
      <section className="cta">
        <h2>开始行动</h2>
        <button className="btn btn-primary btn-lg">立即开始</button>
      </section>

      {/* 页脚 */}
      <footer>...</footer>
    </div>
  );
};

export default HomePage;
```
