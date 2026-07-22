/**
 * 赛博朋克主题 - 角色信息面板组件
 * 游戏内角色属性展示，含头像框、属性条、装备槽
 * 使用 cyberpunk-theme tokens：rarity 系列颜色
 */
import React from 'react';

interface AttrBar {
  label: string;
  current: number;
  max: number;
  color: string;
}

interface EquipmentSlot {
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

const rarityColors: Record<string, string> = {
  common: '#ffffff',
  uncommon: '#1eff00',
  rare: '#0070ff',
  epic: '#a335ee',
  legendary: '#ff8000',
};

const attrs: AttrBar[] = [
  { label: '力量', current: 78, max: 100, color: '#ff4d4f' },
  { label: '敏捷', current: 92, max: 100, color: '#1eff00' },
  { label: '智力', current: 45, max: 100, color: '#0070ff' },
  { label: '精神', current: 63, max: 100, color: '#a335ee' },
];

const equipments: EquipmentSlot[] = [
  { name: '龙鳞战甲', rarity: 'legendary' },
  { name: '暗影之刃', rarity: 'epic' },
  { name: '守护之盾', rarity: 'rare' },
  { name: '疾风之靴', rarity: 'uncommon' },
];

const CharacterPanel: React.FC = () => {
  return (
    <div style={styles.panel}>
      {/* 角色头像与基本信息 */}
      <div style={styles.header}>
        <div style={styles.avatar}>
          <span style={styles.avatarText}>42</span>
        </div>
        <div style={styles.headerInfo}>
          <div style={styles.charName}>暗影行者</div>
          <div style={styles.charClass}>刺客 · Lv.42</div>
        </div>
      </div>

      {/* 属性条 */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>属性</div>
        {attrs.map(attr => (
          <div key={attr.label} style={styles.attrRow}>
            <span style={styles.attrLabel}>{attr.label}</span>
            <div style={styles.attrTrack}>
              <div style={{
                ...styles.attrFill,
                width: `${(attr.current / attr.max) * 100}%`,
                background: attr.color,
              }} />
            </div>
            <span style={styles.attrValue}>{attr.current}</span>
          </div>
        ))}
      </div>

      {/* 装备槽 */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>装备</div>
        {equipments.map((eq, i) => (
          <div key={i} style={{
            ...styles.equipSlot,
            borderColor: rarityColors[eq.rarity],
            boxShadow: `inset 0 0 12px ${rarityColors[eq.rarity]}15, 0 0 6px ${rarityColors[eq.rarity]}30`,
          }}>
            <span style={{
              ...styles.equipName,
              color: rarityColors[eq.rarity],
            }}>
              {eq.name}
            </span>
            <span style={styles.equipRarity}>{eq.rarity.toUpperCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  panel: {
    width: 280,
    background: '#1f1f1f',
    border: '1px solid #434343',
    borderRadius: 6,
    padding: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 13,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 12,
    borderBottom: '1px solid #303030',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 6,
    border: '2px solid #0070ff',
    background: 'linear-gradient(135deg, #531dab, #177ddc)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 12px #0070ff30',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 700,
  },
  headerInfo: {},
  charName: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 2,
  },
  charClass: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.45)',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.45)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 8,
  },
  attrRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  attrLabel: {
    width: 32,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.65)',
  },
  attrTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    background: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  attrFill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.3s',
  },
  attrValue: {
    width: 24,
    textAlign: 'right' as const,
    fontSize: 12,
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    color: 'rgba(255, 255, 255, 0.65)',
  },
  equipSlot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    borderRadius: 4,
    border: '1px solid #434343',
    background: 'rgba(0, 0, 0, 0.3)',
    marginBottom: 6,
  },
  equipName: {
    fontSize: 13,
    fontWeight: 600,
  },
  equipRarity: {
    fontSize: 10,
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    color: 'rgba(255, 255, 255, 0.45)',
  },
};

export default CharacterPanel;
