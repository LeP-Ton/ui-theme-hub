# C端个人中心模板

## 页面结构

```
┌─────────────────────────────────────────┐
│ 导航栏                                   │
├─────────────────────────────────────────┤
│ ┌────────┬────────────────────────────┐ │
│ │ 头像   │ 用户名                     │ │
│ │ 昵称   │ 会员等级                   │ │
│ └────────┴────────────────────────────┘ │
├─────────────────────────────────────────┤
│ 功能网格                                 │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐            │
│ │订单│ │收藏│ │优惠券│ │地址│            │
│ └────┘ └────┘ └────┘ └────┘            │
├─────────────────────────────────────────┤
│ 设置列表                                 │
│ ├ 账号安全                              │
│ ├ 消息通知                              │
│ ├ 隐私设置                              │
│ └ 关于                                  │
├─────────────────────────────────────────┤
│ [退出登录]                               │
└─────────────────────────────────────────┘
```

## 代码骨架

```tsx
import React from 'react';

const ProfilePage: React.FC = () => {
  return (
    <div className="profile-page">
      {/* 用户信息区 */}
      <section className="profile-header">
        <img className="avatar" src="..." alt="头像" />
        <div className="user-info">
          <h2>用户名</h2>
          <span className="member-level">会员等级</span>
        </div>
      </section>

      {/* 功能快捷入口 */}
      <section className="profile-quick-actions">
        <div className="action-grid">
          <button className="action-item">
            <span className="action-icon">📦</span>
            <span className="action-label">我的订单</span>
          </button>
          <button className="action-item">
            <span className="action-icon">❤️</span>
            <span className="action-label">我的收藏</span>
          </button>
          <button className="action-item">
            <span className="action-icon">🎫</span>
            <span className="action-label">优惠券</span>
          </button>
          <button className="action-item">
            <span className="action-icon">📍</span>
            <span className="action-label">收货地址</span>
          </button>
        </div>
      </section>

      {/* 设置列表 */}
      <section className="profile-settings">
        <ul className="settings-list">
          <li>账号安全</li>
          <li>消息通知</li>
          <li>隐私设置</li>
          <li>关于</li>
        </ul>
      </section>

      <button className="btn btn-outline logout-btn">退出登录</button>
    </div>
  );
};

export default ProfilePage;
```
