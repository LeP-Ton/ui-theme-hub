/**
 * AI 演示稿 - 双栏对照卡片组件
 * 提炼自 ai-ppt 的 dual-column + card 结构，适合「问题 / 方法」「痛点 / 方案」类对照页
 * 使用 ai-ppt-theme tokens：primary=#ff6a3d, secondary=#0076ff, calloutBg
 */
import React from 'react';

const DualColumnCard: React.FC = () => {
  return (
    <div style={styles.slide}>
      <p style={styles.slideTag}>02 提示词</p>
      <h2 style={styles.slideTitle}>怎么设计提示词：全局提示词 + Agent 历史文档</h2>

      <div style={styles.dualColumn}>
        {/* 左：问题本质 */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>问题本质</h3>
          <ul style={styles.cardList}>
            <li>自然语言本身是模糊的，很难完全没有歧义</li>
            <li>上下文长度有限，关键信息可能被覆盖或遗失</li>
            <li>多轮任务里目标容易漂移，输出不稳定</li>
          </ul>
        </div>
        {/* 右：我的方法 */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>我的方法</h3>
          <ul style={styles.cardList}>
            <li>全局提示词：统一目标、边界、输出格式</li>
            <li>Agent 历史文档：沉淀决策过程与关键记忆</li>
            <li>每轮只补充差量信息，降低对话漂移</li>
          </ul>
        </div>
      </div>

      {/* 关键词条幅 */}
      <div style={styles.callout}>
        <p style={styles.calloutText}>关键词：【全局提示词】【Agent 历史文档】【差量补充】</p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  slide: {
    fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    color: '#0f2238',
    background: 'linear-gradient(130deg, #f4f8ff, #fff5ea)',
    padding: 38,
    minHeight: 460,
    borderRadius: 22,
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
    fontSize: '2.2rem',
    lineHeight: 1.2,
    wordBreak: 'break-word',
  },
  dualColumn: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 14,
    flex: 1,
  },
  card: {
    border: '1px solid rgba(12, 35, 64, 0.14)',
    borderRadius: 14,
    background: 'rgba(255, 255, 255, 0.73)',
    padding: 16,
  },
  cardTitle: {
    margin: '0 0 8px',
    fontFamily: "'Space Grotesk', 'Noto Sans SC', sans-serif",
    fontSize: '1.1rem',
    letterSpacing: '0.02em',
  },
  cardList: {
    margin: 0,
    padding: 0,
    listStyle: 'disc inside',
    color: '#35506d',
    lineHeight: 1.8,
    fontSize: '0.95rem',
  },
  /* 关键词条幅：左边框强调 */
  callout: {
    borderLeft: '5px solid #ff6a3d',
    borderRadius: 12,
    background: 'rgba(255, 106, 61, 0.11)',
    padding: '12px 14px',
  },
  calloutText: {
    margin: 0,
    color: '#0f2238',
    fontWeight: 600,
    lineHeight: 1.7,
  },
};

export default DualColumnCard;
