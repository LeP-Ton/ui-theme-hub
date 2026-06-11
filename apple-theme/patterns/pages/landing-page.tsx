/**
 * Apple 风格落地页
 * 适用于 C 端产品营销，突出大标题 + CTA + 特性展示
 * 使用 apple-theme tokens：primary=#fa8c16, secondary=#faad14, accent=#eb2f96
 */
import React from 'react';

const LandingPage: React.FC = () => {
  return (
    <div style={styles.page}>
      {/* 顶部导航栏 */}
      <nav style={styles.nav}>
        <span style={styles.logo}>MyApp</span>
        <div style={styles.navLinks}>
          <a style={styles.navLink}>功能</a>
          <a style={styles.navLink}>定价</a>
          <a style={styles.navLink}>关于</a>
          <button style={styles.navCta}>立即体验</button>
        </div>
      </nav>

      {/* 英雄区：大标题 + 副标题 + CTA */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>
          让创意<span style={styles.highlight}>触手可及</span>
        </h1>
        <p style={styles.heroSubtitle}>
          简洁、优雅、强大。为每一位创作者打造的最佳体验。
        </p>
        <div style={styles.ctaGroup}>
          <button style={styles.ctaPrimary}>免费开始</button>
          <button style={styles.ctaSecondary}>了解更多</button>
        </div>
      </section>

      {/* 特性卡片区域 */}
      <section style={styles.features}>
        <h2 style={styles.sectionTitle}>核心特性</h2>
        <div style={styles.featureGrid}>
          {[
            { icon: '⚡', title: '极速体验', desc: '毫秒级响应，流畅无卡顿' },
            { icon: '🎨', title: '精美设计', desc: '每一个像素都经过精心打磨' },
            { icon: '🔒', title: '安全可靠', desc: '企业级安全，数据加密存储' },
          ].map((f, i) => (
            <div key={i} style={styles.featureCard}>
              <span style={styles.featureIcon}>{f.icon}</span>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 页脚 */}
      <footer style={styles.footer}>
        <span>© 2026 MyApp. All rights reserved.</span>
      </footer>
    </div>
  );
};

/* 内联样式，使用 apple-theme token 值 */
const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    background: '#ffffff',
    color: 'rgba(0, 0, 0, 0.85)',
    minHeight: '100vh',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    height: 64,
    borderBottom: '1px solid #ffe7ba',
  },
  logo: {
    fontSize: 20,
    fontWeight: 700,
    color: '#fa8c16',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
  },
  navLink: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.65)',
    cursor: 'pointer',
  },
  navCta: {
    padding: '6px 16px',
    borderRadius: 8,
    border: 'none',
    background: '#fa8c16',
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  hero: {
    textAlign: 'center' as const,
    padding: '80px 24px 64px',
    background: 'linear-gradient(135deg, #fa8c1611 0%, #faad1411 50%, #eb2f9611 100%)',
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: 700,
    lineHeight: 1.25,
    marginBottom: 16,
    letterSpacing: '-0.02em',
  },
  highlight: {
    color: '#fa8c16',
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(0, 0, 0, 0.65)',
    lineHeight: 1.75,
    marginBottom: 32,
  },
  ctaGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: 16,
  },
  ctaPrimary: {
    padding: '12px 32px',
    borderRadius: 12,
    border: 'none',
    background: '#fa8c16',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
  },
  ctaSecondary: {
    padding: '12px 32px',
    borderRadius: 12,
    border: '1px solid #ffc069',
    background: 'transparent',
    color: '#fa8c16',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
  },
  features: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '64px 24px',
  },
  sectionTitle: {
    textAlign: 'center' as const,
    fontSize: 30,
    fontWeight: 700,
    marginBottom: 40,
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 24,
  },
  featureCard: {
    padding: 32,
    borderRadius: 12,
    border: '1px solid #ffe7ba',
    background: '#fff7e6',
    textAlign: 'center' as const,
  },
  featureIcon: {
    fontSize: 36,
    display: 'block',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 8,
  },
  featureDesc: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.65)',
    lineHeight: 1.5,
  },
  footer: {
    textAlign: 'center' as const,
    padding: '24px',
    color: 'rgba(0, 0, 0, 0.45)',
    fontSize: 13,
    borderTop: '1px solid #ffe7ba',
  },
};

export default LandingPage;
