/**
 * AI 演示稿 - 演讲幻灯片页面
 * 提炼自 ai-ppt 项目：顶部元信息 + 浮动光斑背景 + 单页幻灯片内容
 * 使用 ai-ppt-theme tokens：primary=#ff6a3d, secondary=#0076ff, bg=#f4f8ff→#fff5ea
 */
import React from 'react';

const SlidePage: React.FC = () => {
  return (
    <div style={styles.deck}>
      {/* 浮动彩色光斑背景层 */}
      <div style={styles.bgShapes} aria-hidden="true">
        <span style={styles.shapeA} />
        <span style={styles.shapeB} />
        <span style={styles.shapeC} />
      </div>

      {/* 顶部元信息栏 */}
      <header style={styles.topbar}>
        <div style={styles.deckMeta}>
          <p style={styles.deckKicker}>Prompt Sharing Draft</p>
          <h1 style={styles.deckTitle}>提示词、Skills 与 AI Workflow：我的实践分享</h1>
        </div>
        <div style={styles.controlGroup}>
          <span style={styles.btnTag}>01 / 08</span>
          <span style={styles.btnPrimary}>下一页</span>
        </div>
      </header>

      {/* 主舞台：单页幻灯片 */}
      <main style={styles.slideStage}>
        <article style={styles.slide}>
          <p style={styles.slideTag}>01 前言</p>
          <h2 style={styles.slideTitle}>作为第一个分享者：希望打开视野，也欢迎高手指点</h2>
          <p style={styles.lead}>
            其实这周时间比较紧张，准备不太充分，有点担心没讲好；既然是分享，我也真心希望有高手提出建议。
          </p>

          {/* 三栏指标卡片：前言页典型结构 */}
          <div style={styles.metricGrid}>
            {[
              { value: '定位', label: '第一个分享者，先抛砖引玉' },
              { value: '主题', label: '提示词设计与实战玩法' },
              { value: '互动', label: '欢迎现场补充与会后交流' },
            ].map((m, i) => (
              <div key={i} style={styles.metricCard}>
                <p style={styles.metricValue}>{m.value}</p>
                <p style={styles.metricLabel}>{m.label}</p>
              </div>
            ))}
          </div>
        </article>
      </main>

      {/* 底部进度栏 */}
      <footer style={styles.statusbar}>
        <span style={styles.statusText}>1 / 8</span>
        <div style={styles.progressTrack}>
          <span style={styles.progressBar} />
        </div>
      </footer>
    </div>
  );
};

/* 内联样式，使用 ai-ppt-theme token 值 */
const styles: Record<string, React.CSSProperties> = {
  deck: {
    position: 'relative',
    fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    color: '#0f2238',
    background: 'linear-gradient(130deg, #f4f8ff, #fff5ea)',
    minHeight: '100vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  /* 浮动光斑背景 */
  bgShapes: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
  },
  shapeA: {
    position: 'absolute',
    width: 420,
    height: 420,
    top: -120,
    left: -60,
    borderRadius: 999,
    filter: 'blur(2px)',
    opacity: 0.58,
    background: 'radial-gradient(circle at 30% 30%, #ffd097, #ff7d45)',
  },
  shapeB: {
    position: 'absolute',
    width: 360,
    height: 360,
    right: '12%',
    top: '8%',
    borderRadius: 999,
    filter: 'blur(2px)',
    opacity: 0.58,
    background: 'radial-gradient(circle at 40% 40%, #8ce7ff, #0076ff)',
  },
  shapeC: {
    position: 'absolute',
    width: 280,
    height: 280,
    right: '10%',
    bottom: -80,
    borderRadius: 999,
    filter: 'blur(2px)',
    opacity: 0.58,
    background: 'radial-gradient(circle at 30% 30%, #ffe8c2, #ffbe7d)',
  },
  /* 顶部元信息 */
  topbar: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    padding: '20px 24px 10px',
  },
  deckMeta: {
    maxWidth: 720,
  },
  deckKicker: {
    margin: 0,
    fontFamily: "'Space Grotesk', 'Noto Sans SC', sans-serif",
    fontSize: '0.88rem',
    color: '#0076ff',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  deckTitle: {
    margin: '8px 0 0',
    fontFamily: "'Space Grotesk', 'Noto Sans SC', sans-serif",
    fontSize: '2.1rem',
    lineHeight: 1.2,
    letterSpacing: '0.02em',
  },
  controlGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  btnTag: {
    border: '1px solid rgba(12, 35, 64, 0.14)',
    background: 'rgba(255, 255, 255, 0.82)',
    color: '#0f2238',
    borderRadius: 999,
    padding: '8px 14px',
    fontSize: '0.88rem',
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
  },
  btnPrimary: {
    background: 'linear-gradient(120deg, #ff6a3d, #ff946e)',
    color: '#fff',
    border: '1px solid transparent',
    borderRadius: 999,
    padding: '8px 14px',
    fontSize: '0.88rem',
    fontWeight: 600,
  },
  /* 幻灯片舞台：毛玻璃面板 */
  slideStage: {
    position: 'relative',
    zIndex: 2,
    flex: 1,
    margin: '0 24px 18px',
    borderRadius: 22,
    border: '1px solid rgba(12, 35, 64, 0.14)',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 12px 32px rgba(15, 34, 56, 0.12)',
    overflow: 'hidden',
    minHeight: 460,
  },
  slide: {
    position: 'relative',
    height: '100%',
    minHeight: 460,
    padding: 38,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  slideTag: {
    margin: 0,
    fontFamily: "'Space Grotesk', 'Noto Sans SC', sans-serif",
    fontSize: '0.82rem',
    color: '#0076ff',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  slideTitle: {
    margin: 0,
    fontSize: '2.5rem',
    lineHeight: 1.2,
    wordBreak: 'break-word',
  },
  lead: {
    margin: 0,
    fontSize: '1.25rem',
    color: '#35506d',
    lineHeight: 1.7,
    maxWidth: '70ch',
  },
  /* 三栏指标卡片 */
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 16,
    marginTop: 'auto',
  },
  metricCard: {
    border: '1px solid rgba(12, 35, 64, 0.14)',
    borderRadius: 14,
    background: 'rgba(255, 255, 255, 0.7)',
    padding: 18,
  },
  metricValue: {
    margin: 0,
    fontFamily: "'Space Grotesk', 'Noto Sans SC', sans-serif",
    fontSize: '2rem',
    color: '#ff6a3d',
    letterSpacing: '0.02em',
  },
  metricLabel: {
    margin: '6px 0 0',
    color: '#35506d',
    fontSize: '0.9rem',
  },
  /* 底部进度栏 */
  statusbar: {
    position: 'relative',
    zIndex: 2,
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: 14,
    padding: '0 24px 16px',
  },
  statusText: {
    fontFamily: "'Space Grotesk', 'Noto Sans SC', sans-serif",
    fontWeight: 700,
    color: '#0f2238',
  },
  progressTrack: {
    height: 8,
    background: 'rgba(255, 255, 255, 0.74)',
    border: '1px solid rgba(12, 35, 64, 0.14)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBar: {
    display: 'block',
    width: '12.5%',
    height: '100%',
    background: 'linear-gradient(120deg, #0076ff, #58b3ff)',
  },
};

export default SlidePage;
