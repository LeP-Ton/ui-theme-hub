# 游戏 HUD 模板

## 页面结构

```
┌──────────────────────────────────────────┐
│ ┌──────────────────────────────────────┐ │
│ │ HP ████████░░  MP ██████░░░  Lv.12  │ │
│ └──────────────────────────────────────┘ │
│                                          │
│              游戏画面                     │
│                                          │
│                        ┌────────┐        │
│                        │ 小地图 │        │
│                        └────────┘        │
│ ┌──────────────────────────────────────┐ │
│ │ [Q][W][E][R][T]  💰 1234  🎒 ⚙️    │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

## 代码骨架

```tsx
import React, { useState } from 'react';

const GameHUD: React.FC = () => {
  const [hp, setHp] = useState(85);
  const [mp, setMp] = useState(60);

  return (
    <div className="game-hud">
      {/* 顶部状态栏 */}
      <header className="hud-top">
        <div className="status-bars">
          <div className="bar hp-bar">
            <div className="bar-fill" style={{ width: `${hp}%` }} />
            <span className="bar-text">{hp}/100</span>
          </div>
          <div className="bar mp-bar">
            <div className="bar-fill" style={{ width: `${mp}%` }} />
            <span className="bar-text">{mp}/100</span>
          </div>
        </div>
        <div className="level-badge">Lv.12</div>
      </header>

      {/* 右下角小地图 */}
      <div className="minimap">
        {/* 小地图渲染 */}
      </div>

      {/* 底部技能栏 */}
      <footer className="hud-bottom">
        <div className="skill-bar">
          {['Q', 'W', 'E', 'R', 'T'].map((key, i) => (
            <div key={key} className="skill-slot">
              <img className="skill-icon" src={`skill-${i + 1}.png`} alt={`技能${i + 1}`} />
              <span className="skill-key">{key}</span>
              {/* 冷却遮罩 */}
              <div className="skill-cooldown" style={{ display: 'none' }} />
            </div>
          ))}
        </div>

        {/* 右侧快捷操作 */}
        <div className="quick-actions">
          <div className="currency">💰 1234</div>
          <button className="action-btn">🎒</button>
          <button className="action-btn">⚙️</button>
        </div>
      </footer>
    </div>
  );
};

export default GameHUD;
```

## 关键样式

```css
.game-hud {
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: none; /* 不阻挡游戏画面点击 */
}

.game-hud > * {
  pointer-events: auto; /* HUD 元素可交互 */
}

.hud-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 8px 16px;
}

.bar {
  height: 12px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.3s ease;
}

.hp-bar .bar-fill { background: linear-gradient(90deg, #ff4d4f, #ff7875); }
.mp-bar .bar-fill { background: linear-gradient(90deg, #1677ff, #69b1ff); }

.skill-slot {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  border: 2px solid var(--color-border-default);
  background: rgba(0, 0, 0, 0.6);
  position: relative;
}

.skill-slot.rarity-rare { border-color: #0070ff; box-shadow: 0 0 8px #0070ff40; }
.skill-slot.rarity-epic { border-color: #a335ee; box-shadow: 0 0 8px #a335ee40; }
```
