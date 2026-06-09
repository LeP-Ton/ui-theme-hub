# C端产品详情页模板

## 页面结构

```
┌─────────────────────────────────────────┐
│ 导航栏                                   │
├─────────────────────────────────────────┤
│ 面包屑                                   │
├─────────────────────────────────────────┤
│ ┌───────────────┬─────────────────────┐ │
│ │ 产品图片      │ 产品名称            │ │
│ │ （大图+缩略图）│ 评分/价格          │ │
│ │               │ 描述               │ │
│ │               │ 规格/选项          │ │
│ │               │ [加入购物车] [收藏]│ │
│ └───────────────┴─────────────────────┘ │
├─────────────────────────────────────────┤
│ 详情标签页（描述 | 参数 | 评价）         │
├─────────────────────────────────────────┤
│ 相关推荐                                 │
├─────────────────────────────────────────┤
│ 页脚                                     │
└─────────────────────────────────────────┘
```

## 代码骨架

```tsx
import React, { useState } from 'react';

const ProductPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('description');

  return (
    <div className="product-page">
      <nav className="breadcrumb">...</nav>

      <section className="product-main">
        {/* 产品图片 */}
        <div className="product-gallery">
          <img className="product-image" src="..." alt="产品图" />
          <div className="product-thumbnails">...</div>
        </div>

        {/* 产品信息 */}
        <div className="product-info">
          <h1 className="product-name">产品名称</h1>
          <div className="product-rating">评分/评价数</div>
          <div className="product-price">价格</div>
          <p className="product-desc">描述</p>
          <div className="product-options">规格选择</div>
          <div className="product-actions">
            <button className="btn btn-primary btn-lg">加入购物车</button>
            <button className="btn btn-outline">收藏</button>
          </div>
        </div>
      </section>

      {/* 详情标签页 */}
      <section className="product-detail">
        <div className="tabs">
          <button className={activeTab === 'description' ? 'active' : ''}>描述</button>
          <button className={activeTab === 'specs' ? 'active' : ''}>参数</button>
          <button className={activeTab === 'reviews' ? 'active' : ''}>评价</button>
        </div>
        <div className="tab-content">...</div>
      </section>

      {/* 相关推荐 */}
      <section className="related-products">...</section>
    </div>
  );
};

export default ProductPage;
```
