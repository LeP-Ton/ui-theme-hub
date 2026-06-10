# 通用导航区块模板

## 桌面端导航

```
┌──────────────────────────────────────────┐
│ Logo  首页 产品 关于  [登录] [免费开始]  │
└──────────────────────────────────────────┘
```

## 移动端导航

```
┌──────────────────────┐
│ Logo          [☰]    │
└──────────────────────┘
```

## 代码骨架

```tsx
import React, { useState, useEffect } from 'react';

const Navigation: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="nav-container">
        <a className="nav-logo" href="/">Logo</a>

        {/* 桌面端链接 */}
        <nav className="nav-links">
          <a href="#features">特性</a>
          <a href="#pricing">定价</a>
          <a href="#about">关于</a>
        </nav>

        <div className="nav-actions">
          <button className="btn btn-ghost">登录</button>
          <button className="btn btn-primary">免费开始</button>
        </div>

        {/* 移动端汉堡菜单 */}
        <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </div>

      {/* 移动端菜单 */}
      {menuOpen && (
        <div className="nav-mobile-menu">
          <a href="#features">特性</a>
          <a href="#pricing">定价</a>
          <a href="#about">关于</a>
          <button className="btn btn-primary">免费开始</button>
        </div>
      )}
    </header>
  );
};

export default Navigation;
```

## 关键样式

```css
.nav {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 100;
  transition: background var(--duration-base) var(--easing-standard);
}

/* 透明导航（滚动后变实色） */
.nav { background: transparent; }
.nav-scrolled { background: var(--color-bg-base); box-shadow: var(--shadow-sm); }

/* 移动端隐藏桌面链接 */
@media (max-width: 768px) {
  .nav-links, .nav-actions { display: none; }
  .nav-hamburger { display: block; }
}
```
