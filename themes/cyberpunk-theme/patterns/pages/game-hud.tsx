/**
 * 赛博朋克主题 - 游戏 HUD 页面
 * 全屏游戏 HUD 布局：顶部状态条 + 右下小地图 + 底部技能栏
 * 使用 cyberpunk-theme tokens：primary=#177ddc, dark bg=#141414/#1f1f1f
 */
import React, { useState } from 'react';

const GameHUDPage: React.FC = () => {
  const [hp] = useState(85);
  const [mp] = useState(60);

  return (
    <div style={styles.hud}>
      {/* 顶部状态栏 */}
      <header style={styles.topBar}>
        <div style={styles.barsContainer}>
          {/* HP 条 */}
          <div style={styles.barRow}>
            <span style={styles.barLabel}>HP</span>
            <div style={styles.barTrack}>
              <div style={{ ...styles.barFill, width: `${hp}%`, background: 'linear-gradient(90deg, #ff4d4f, #ff7875)' }} />
            </div>
            <span style={styles.barText}>{hp}/100</span>
          </div>
          {/* MP 条 */}
          <div style={styles.barRow}>
            <span style={styles.barLabel}>MP</span>
            <div style={styles.barTrack}>
              <div style={{ ...styles.barFill, width: `${mp}%`, background: 'linear-gradient(90deg, #177ddc, #69b1ff)' }} />
            </div>
            <span style={styles.barText}>{mp}/100</span>
          </div>
        </div>
        <div style={styles.levelBadge}>Lv.42</div>
      </header>

      {/* 中央游戏画面占位 */}
      <div style={styles.gameArea}>
        <span style={styles.gameAreaText}>游戏画面区域</span>
      </div>

      {/* 右下角小地图 */}
      <div style={styles.minimap}>
        <div style={styles.minimapBorder}>小地图</div>
      </div>

      {/* 底部技能栏 */}
      <footer style={styles.bottomBar}>
        <div style={styles.skillBar}>
          {[
            { key: 'Q', name: '斩击', rarity: 'rare' },
            { key: 'W', name: '闪避', rarity: 'common' },
            { key: 'E', name: '火球', rarity: 'epic' },
            { key: 'R', name: '终极', rarity: 'legendary' },
            { key: 'T', name: '治疗', rarity: 'uncommon' },
          ].map((skill, i) => (
            <div
              key={skill.key}
              style={{
                ...styles.skillSlot,
                borderColor: rarityColor[skill.rarity],
                boxShadow: `0 0 8px ${rarityColor[skill.rarity]}40`,
              }}
            >
              <span style={styles.skillName}>{skill.name}</span>
              <span style={styles.skillKey}>{skill.key}</span>
            </div>
          ))}
        </div>
        <div style={styles.quickActions}>
          <div style={styles.currency}>💰 12,480</div>
          <button style={styles.actionBtn}>🎒</button>
          <button style={styles.actionBtn}>⚙️</button>
        </div>
      </footer>
    </div>
  );
};

/* 稀有度颜色映射 */
const rarityColor: Record<string, string> = {
  common: '#ffffff',
  uncommon: '#1eff00',
  rare: '#0070ff',
  epic: '#a335ee',
  legendary: '#ff8000',
};

const styles: Record<string, React.CSSProperties> = {
  hud: {
    position: 'relative',
    width: '100%',
    height: '100vh',
    background: '#141414',
    color: 'rgba(255, 255, 255, 0.85)',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(8px)',
    borderBottom: '1px solid #434343',
    zIndex: 10,
  },
  barsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
  },
  barRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: {
    fontSize: 11,
    fontWeight: 700,
    width: 24,
    color: 'rgba(255, 255, 255, 0.65)',
  },
  barTrack: {
    width: 200,
    height: 10,
    borderRadius: 5,
    background: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
    transition: 'width 0.3s ease',
  },
  barText: {
    fontSize: 11,
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    color: 'rgba(255, 255, 255, 0.65)',
  },
  levelBadge: {
    padding: '4px 14px',
    borderRadius: 4,
    background: 'linear-gradient(135deg, #531dab, #177ddc)',
    fontSize: 14,
    fontWeight: 700,
    border: '1px solid #13c2c2',
  },
  gameArea: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameAreaText: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.2)',
    letterSpacing: '0.1em',
  },
  minimap: {
    position: 'absolute' as const,
    right: 20,
    bottom: 80,
    width: 160,
    height: 160,
  },
  minimapBorder: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    border: '2px solid #434343',
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.45)',
  },
  bottomBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(8px)',
    borderTop: '1px solid #434343',
  },
  skillBar: {
    display: 'flex',
    gap: 6,
  },
  skillSlot: {
    width: 56,
    height: 56,
    borderRadius: 6,
    border: '2px solid #434343',
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  skillName: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  skillKey: {
    fontSize: 10,
    fontWeight: 700,
    color: 'rgba(255, 255, 255, 0.45)',
    fontFamily: "'SF Mono', 'Fira Code', monospace",
  },
  quickActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  currency: {
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    color: '#d89614',
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 6,
    border: '1px solid #434343',
    background: 'rgba(0, 0, 0, 0.5)',
    fontSize: 18,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default GameHUDPage;
