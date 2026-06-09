# 营销落地页模板

## 页面结构

```
┌─────────────────────────────────────────┐
│ 导航栏（Logo + 导航 + CTA按钮）         │
├─────────────────────────────────────────┤
│ Hero Banner                              │
│ ┌─────────────────────────────────────┐ │
│ │ 大标题                               │ │
│ │ 副标题                               │ │
│ │ [主CTA] [次CTA]                     │ │
│ │ 产品截图/插画                        │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ 信任背书（合作伙伴 Logo 墙）            │
├─────────────────────────────────────────┤
│ 核心价值区                               │
│ ┌────┐ ┌────┐ ┌────┐                    │
│ │图标│ │图标│ │图标│                    │
│ │标题│ │标题│ │标题│                    │
│ │描述│ │描述│ │描述│                    │
│ └────┘ └────┘ └────┘                    │
├─────────────────────────────────────────┤
│ 产品展示（大图+功能描述）                │
├─────────────────────────────────────────┤
│ 定价方案                                 │
│ ┌────┐ ┌────────┐ ┌────┐                │
│ │基础│ │专业推荐│ │企业│                │
│ │免费│ │¥99/月 │ │定制│                │
│ └────┘ └────────┘ └────┘                │
├─────────────────────────────────────────┤
│ 客户证言                                 │
│ ┌────┐ ┌────┐ ┌────┐                    │
│ │头像│ │头像│ │头像│                    │
│ │评价│ │评价│ │评价│                    │
│ │姓名│ │姓名│ │姓名│                    │
│ └────┘ └────┘ └────┘                    │
├─────────────────────────────────────────┤
│ 常见问题（折叠面板）                     │
├─────────────────────────────────────────┤
│ 底部 CTA                                 │
│ 号召文案 + [免费开始]                   │
├─────────────────────────────────────────┤
│ 页脚                                     │
└─────────────────────────────────────────┘
```

## 代码骨架

```tsx
import React from 'react';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      {/* 导航栏 */}
      <header className="nav">
        <div className="nav-logo">Logo</div>
        <nav className="nav-links">
          <a href="#features">特性</a>
          <a href="#pricing">定价</a>
          <a href="#testimonials">评价</a>
        </nav>
        <button className="btn btn-primary">免费开始</button>
      </header>

      {/* Hero */}
      <section className="hero">
        <h1>大标题：一句话说明产品价值</h1>
        <p className="hero-subtitle">副标题：补充说明</p>
        <div className="hero-cta">
          <button className="btn btn-primary btn-lg">免费开始</button>
          <button className="btn btn-outline btn-lg">了解更多</button>
        </div>
        <div className="hero-visual">
          {/* 产品截图或插画 */}
        </div>
      </section>

      {/* 信任背书 */}
      <section className="social-proof">
        <p>受到以下企业信赖</p>
        <div className="logo-wall">...</div>
      </section>

      {/* 核心价值 */}
      <section id="features" className="features">
        <h2>核心特性</h2>
        <div className="feature-grid">
          {/* 特性卡片：图标 + 标题 + 描述 */}
        </div>
      </section>

      {/* 产品展示 */}
      <section className="showcase">...</section>

      {/* 定价 */}
      <section id="pricing" className="pricing">
        <h2>选择方案</h2>
        <div className="pricing-cards">
          {/* 定价卡片 */}
        </div>
      </section>

      {/* 评价 */}
      <section id="testimonials" className="testimonials">
        <h2>客户评价</h2>
        <div className="testimonial-grid">...</div>
      </section>

      {/* 常见问题 */}
      <section className="faq">
        <h2>常见问题</h2>
        <div className="faq-list">...</div>
      </section>

      {/* 底部 CTA */}
      <section className="cta">
        <h2>准备好开始了吗？</h2>
        <button className="btn btn-primary btn-lg">免费开始</button>
      </section>

      <footer>...</footer>
    </div>
  );
};

export default LandingPage;
```
