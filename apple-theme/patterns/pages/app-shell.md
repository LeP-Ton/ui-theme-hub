# 移动端应用外壳模板

## 页面结构

```
┌──────────────────────┐
│ 安全区（顶部）        │
├──────────────────────┤
│ 导航栏（44px）        │
│ ← 返回  标题  操作   │
├──────────────────────┤
│                      │
│ 内容区域             │
│ （可滚动，下拉刷新） │
│                      │
│                      │
├──────────────────────┤
│ 底部标签栏（50px）    │
│ [首页] [发现] [我的]  │
├──────────────────────┤
│ 安全区（底部）        │
└──────────────────────┘
```

## 代码骨架

```tsx
import React, { useState } from 'react';

const AppShell: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="app-shell">
      {/* 顶部导航栏 */}
      <header className="app-nav">
        <div className="app-nav-safe-top" />
        <div className="app-nav-bar">
          <button className="nav-back">←</button>
          <h1 className="nav-title">标题</h1>
          <button className="nav-action">...</button>
        </div>
      </header>

      {/* 内容区 */}
      <main className="app-content">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'discover' && <DiscoverPage />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>

      {/* 底部标签栏 */}
      <nav className="app-tab-bar">
        <button
          className={`tab-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <span className="tab-icon">🏠</span>
          <span className="tab-label">首页</span>
        </button>
        <button
          className={`tab-item ${activeTab === 'discover' ? 'active' : ''}`}
          onClick={() => setActiveTab('discover')}
        >
          <span className="tab-icon">🔍</span>
          <span className="tab-label">发现</span>
        </button>
        <button
          className={`tab-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <span className="tab-icon">👤</span>
          <span className="tab-label">我的</span>
        </button>
      </nav>

      {/* 底部安全区 */}
      <div className="app-safe-bottom" />
    </div>
  );
};

export default AppShell;
```

## 关键样式

```css
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh; /* 动态视口高度 */
}

.app-nav-safe-top {
  height: env(safe-area-inset-top, 0px);
}

.app-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.app-tab-bar {
  display: flex;
  height: 50px;
  border-top: 1px solid var(--color-border-default);
  background: var(--color-bg-elevated);
}

.app-safe-bottom {
  height: env(safe-area-inset-bottom, 0px);
  background: var(--color-bg-elevated);
}
```
