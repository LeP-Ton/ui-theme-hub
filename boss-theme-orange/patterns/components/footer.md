# 通用页脚区块模板

## 结构

```
┌──────────────────────────────────────────┐
│ Logo + 简介                               │
├──────────┬──────────┬──────────┬─────────┤
│ 产品     │ 资源     │ 公司     │ 社交    │
│ 链接1    │ 链接1    │ 链接1    │ 图标1   │
│ 链接2    │ 链接2    │ 链接2    │ 图标2   │
│ 链接3    │ 链接3    │ 链接3    │ 图标3   │
├──────────┴──────────┴──────────┴─────────┤
│ © 2024 Company. All rights reserved.      │
└──────────────────────────────────────────┘
```

## 代码骨架

```tsx
const Footer: React.FC = () => {
  const columns = [
    { title: '产品', links: ['功能', '定价', '更新日志', '路线图'] },
    { title: '资源', links: ['文档', 'API', '社区', '博客'] },
    { title: '公司', links: ['关于', '招贤', '联系', '品牌'] },
  ];

  return (
    <footer style={{
      background: 'var(--color-bg-muted)',
      padding: 'var(--spacing-12) var(--spacing-4) var(--spacing-6)',
    }}>
      <div style={{ maxWidth: 1200, marginInline: 'auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr repeat(3, 1fr)',
          gap: 'var(--spacing-8)',
        }}>
          {/* Logo + 简介 */}
          <div>
            <div className="footer-logo">Logo</div>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-2)' }}>
              一句话描述产品
            </p>
          </div>
          {/* 链接列 */}
          {columns.map(col => (
            <div key={col.title}>
              <h4>{col.title}</h4>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: 'var(--spacing-2)' }}>
                {col.links.map(link => (
                  <li key={link}><a href="#">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{
          borderTop: '1px solid var(--color-border-default)',
          marginTop: 'var(--spacing-8)',
          paddingTop: 'var(--spacing-4)',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--font-size-sm)',
        }}>
          © 2024 Company. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
```
