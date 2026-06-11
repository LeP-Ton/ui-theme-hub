/**
 * 主题详情页交互逻辑
 * 通过 URL 参数 ?theme=xxx 加载对应主题的完整信息
 */
(function () {
  'use strict';

  const $loading = document.getElementById('loading');
  const $main = document.getElementById('detail-main');
  const $pageTitle = document.getElementById('page-title');

  /* ========== 初始化 ========== */
  async function init() {
    const params = new URLSearchParams(window.location.search);
    const themeName = params.get('theme');

    if (!themeName) {
      showNotFound('缺少主题参数');
      return;
    }

    let theme;
    try {
      const res = await fetch('./themes-index.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      theme = (data.themes || []).find(t => t.dir === themeName || t.name === themeName);
    } catch (err) {
      console.error('加载主题数据失败:', err);
      showNotFound('无法加载主题数据');
      return;
    }

    if (!theme) {
      showNotFound(`未找到主题: ${themeName}`);
      return;
    }

    $pageTitle.textContent = theme.name;
    document.title = `${theme.name} - UI Theme Hub`;
    renderDetail(theme);

    $loading.style.display = 'none';
    $main.style.display = 'block';
  }

  /* ========== 渲染详情页 ========== */
  function renderDetail(theme) {
    const colors = theme.tokens?.color || {};
    const primary = colors.primary || '#6366f1';
    const secondary = colors.secondary || '#818cf8';
    const accent = colors.accent || '#a78bfa';

    /* 预览区 */
    const previewArea = theme.previews.length > 0
      ? renderDetailPreviewImages(theme)
      : renderDetailPreviewFallback(theme, primary, secondary, accent);

    /* scene 徽章 */
    const sceneLabel = { 'c-end': 'C端', 'enterprise': '企业级', 'game': '游戏' };
    const sceneBadge = `<span class="detail-scene scene-${theme.scene}">${sceneLabel[theme.scene] || theme.scene}</span>`;

    /* tags */
    const tags = theme.tags.map(t => `<span class="detail-tag">${escapeHTML(t)}</span>`).join('');

    /* 依赖 */
    const requires = theme.requires && theme.requires.length > 0
      ? `<div class="detail-requires">依赖：${theme.requires.map(r =>
          `<a href="${escapeHTML(r.source)}" target="_blank" rel="noopener">${escapeHTML(r.name)}</a>`
        ).join('、')}</div>`
      : '';

    /* tokens 区块 */
    const tokenSections = [];
    if (theme.tokens) {
      if (theme.tokens.color) tokenSections.push(renderColorSection(theme.tokens.color));
      if (theme.tokens.spacing) tokenSections.push(renderSpacingSection(theme.tokens.spacing));
      if (theme.tokens.typography) tokenSections.push(renderTypographySection(theme.tokens.typography));
      if (theme.tokens.border) tokenSections.push(renderBorderSection(theme.tokens.border));
      if (theme.tokens.shadow) tokenSections.push(renderShadowSection(theme.tokens.shadow));
      if (theme.tokens.motion) tokenSections.push(renderMotionSection(theme.tokens.motion));
    }

    $main.innerHTML = `
      <div class="detail-hero">
        ${previewArea}
        <div class="detail-info">
          <div class="detail-header">
            <h1 class="detail-name">${escapeHTML(theme.name)}</h1>
            <span class="detail-version">v${escapeHTML(theme.version)}</span>
          </div>
          <p class="detail-desc">${escapeHTML(theme.description)}</p>
          <div class="detail-meta">
            ${sceneBadge}
            <span class="detail-author">by ${escapeHTML(theme.author)}</span>
          </div>
          <div class="detail-tags">${tags}</div>
          ${requires}
        </div>
      </div>
      ${tokenSections.join('')}
    `;

    /* 绑定折叠事件 */
    $main.querySelectorAll('.token-section-title').forEach(title => {
      title.addEventListener('click', () => {
        title.parentElement.classList.toggle('collapsed');
      });
    });

    /* 绑定色彩点击复制 */
    $main.querySelectorAll('.color-item').forEach(item => {
      item.addEventListener('click', () => {
        const value = item.dataset.color;
        navigator.clipboard?.writeText(value).then(() => {
          const label = item.querySelector('.color-value');
          const original = label.textContent;
          label.textContent = '已复制!';
          setTimeout(() => { label.textContent = original; }, 1000);
        });
      });
    });
  }

  /* ========== 预览区渲染 ========== */
  function renderDetailPreviewImages(theme) {
    const images = theme.previews.map(src =>
      `<img src="${src}" alt="${theme.name} 预览" loading="lazy" onerror="this.style.display='none'">`
    ).join('');
    return `<div class="detail-preview-area">${images}</div>`;
  }

  function renderDetailPreviewFallback(theme, primary, secondary, accent) {
    return `
      <div class="detail-preview-fallback" style="
        background: linear-gradient(135deg, ${primary}22 0%, ${secondary}22 50%, ${accent}22 100%);
        border-bottom: 3px solid ${primary};
      ">
        <span class="fallback-name" style="color:${primary}">${escapeHTML(theme.name)}</span>
        <div class="fallback-colors">
          <span style="background:${primary}" title="primary"></span>
          <span style="background:${secondary}" title="secondary"></span>
          <span style="background:${accent}" title="accent"></span>
        </div>
      </div>
    `;
  }

  /* ========== Token 区块渲染 ========== */

  /* 色彩区块 */
  function renderColorSection(color) {
    /* 语义色 */
    const semanticKeys = ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'info'];
    const semanticItems = semanticKeys
      .filter(k => color[k])
      .map(k => renderColorItem(k, color[k]));

    /* 背景色 */
    const bgItems = color.background
      ? flattenObj(color.background, 'bg').map(([k, v]) => renderColorItem(k, v))
      : [];

    /* 文本色 */
    const textItems = color.text
      ? flattenObj(color.text, 'text').map(([k, v]) => renderColorItem(k, v))
      : [];

    /* 边框色 */
    const borderItems = color.border
      ? flattenObj(color.border, 'border').map(([k, v]) => renderColorItem(k, v))
      : [];

    /* 扩展色 */
    const extItems = color.extended
      ? flattenObj(color.extended, 'ext').map(([k, v]) => renderColorItem(k, v))
      : [];

    const allItems = [...semanticItems, ...bgItems, ...textItems, ...borderItems, ...extItems];

    return `
      <div class="token-section">
        <div class="token-section-title">
          色彩 (Color)
          <span class="toggle-icon">▼</span>
        </div>
        <div class="token-section-body">
          <div class="color-grid">${allItems.join('')}</div>
        </div>
      </div>
    `;
  }

  function renderColorItem(label, value) {
    const colorStr = String(value);
    return `
      <div class="color-item" data-color="${escapeHTML(colorStr)}" title="点击复制">
        <span class="color-swatch" style="background:${colorStr}"></span>
        <div class="color-info">
          <div class="color-label">${escapeHTML(label)}</div>
          <div class="color-value">${escapeHTML(colorStr)}</div>
        </div>
      </div>
    `;
  }

  /* 间距区块 */
  function renderSpacingSection(spacing) {
    const rows = [];
    if (spacing.unit != null) rows.push(`<tr><td>基础单位</td><td><code>${spacing.unit}px</code></td></tr>`);

    if (spacing.scale) {
      const maxVal = Math.max(...spacing.scale.filter(v => typeof v === 'number'), 1);
      const scaleBar = spacing.scale.map(v => {
        const h = Math.max(4, (v / maxVal) * 48);
        return `<div class="scale-item"><div class="scale-block" style="height:${h}px"></div><span class="scale-label">${v}</span></div>`;
      }).join('');
      rows.push(`<tr><td>间距阶梯</td><td><div class="scale-bar">${scaleBar}</div></td></tr>`);
    }

    if (spacing.extended) {
      for (const [k, v] of Object.entries(spacing.extended)) {
        rows.push(`<tr><td>${escapeHTML(k)}</td><td><code>${escapeHTML(String(v))}</code></td></tr>`);
      }
    }

    return renderTokenTable('间距 (Spacing)', rows);
  }

  /* 排版区块 */
  function renderTypographySection(typography) {
    const rows = [];

    if (typography.fontFamily) {
      for (const [k, v] of Object.entries(typography.fontFamily)) {
        rows.push(`<tr><td>字体-${escapeHTML(k)}</td><td><code>${escapeHTML(String(v))}</code></td></tr>`);
      }
    }

    if (typography.fontSize) {
      const sizes = Object.entries(typography.fontSize)
        .map(([k, v]) => `${k}: ${v}px`)
        .join('、');
      rows.push(`<tr><td>字号</td><td><code>${escapeHTML(sizes)}</code></td></tr>`);
    }

    if (typography.fontWeight) {
      const weights = Object.entries(typography.fontWeight)
        .map(([k, v]) => `${k}: ${v}`)
        .join('、');
      rows.push(`<tr><td>字重</td><td><code>${escapeHTML(weights)}</code></td></tr>`);
    }

    if (typography.lineHeight) {
      const heights = Object.entries(typography.lineHeight)
        .map(([k, v]) => `${k}: ${v}`)
        .join('、');
      rows.push(`<tr><td>行高</td><td><code>${escapeHTML(heights)}</code></td></tr>`);
    }

    return renderTokenTable('排版 (Typography)', rows);
  }

  /* 边框区块 */
  function renderBorderSection(border) {
    const rows = [];

    if (border.radius) {
      for (const [k, v] of Object.entries(border.radius)) {
        rows.push(`<tr><td>圆角-${escapeHTML(k)}</td><td><code>${escapeHTML(String(v))}px</code></td></tr>`);
      }
    }

    if (border.width) {
      for (const [k, v] of Object.entries(border.width)) {
        rows.push(`<tr><td>边框宽度-${escapeHTML(k)}</td><td><code>${escapeHTML(String(v))}px</code></td></tr>`);
      }
    }

    return renderTokenTable('边框 (Border)', rows);
  }

  /* 阴影区块 */
  function renderShadowSection(shadow) {
    const rows = [];
    for (const [k, v] of Object.entries(shadow)) {
      rows.push(`
        <tr>
          <td>${escapeHTML(k)}</td>
          <td>
            <span style="display:inline-block;width:40px;height:24px;border-radius:4px;box-shadow:${v};background:#fff;vertical-align:middle;margin-right:8px;border:1px solid var(--border)"></span>
            <code>${escapeHTML(String(v))}</code>
          </td>
        </tr>
      `);
    }
    return renderTokenTable('阴影 (Shadow)', rows);
  }

  /* 动效区块 */
  function renderMotionSection(motion) {
    const rows = [];
    rows.push(`<tr><td>启用动效</td><td><code>${motion.enabled ? '是' : '否'}</code></td></tr>`);

    if (motion.duration) {
      for (const [k, v] of Object.entries(motion.duration)) {
        rows.push(`<tr><td>时长-${escapeHTML(k)}</td><td><code>${escapeHTML(String(v))}</code></td></tr>`);
      }
    }

    if (motion.easing) {
      for (const [k, v] of Object.entries(motion.easing)) {
        rows.push(`<tr><td>缓动-${escapeHTML(k)}</td><td><code>${escapeHTML(String(v))}</code></td></tr>`);
      }
    }

    return renderTokenTable('动效 (Motion)', rows);
  }

  /* 通用表格渲染 */
  function renderTokenTable(title, rows) {
    return `
      <div class="token-section">
        <div class="token-section-title">
          ${title}
          <span class="toggle-icon">▼</span>
        </div>
        <div class="token-section-body">
          <table class="token-table">
            <tbody>${rows.join('')}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  /* ========== 工具函数 ========== */

  /* 扁平化嵌套对象，key 用 - 连接 */
  function flattenObj(obj, prefix) {
    const result = [];
    for (const [k, v] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}-${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        result.push(...flattenObj(v, fullKey));
      } else {
        result.push([fullKey, v]);
      }
    }
    return result;
  }

  /* HTML 转义 */
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* 未找到 */
  function showNotFound(msg) {
    $loading.style.display = 'none';
    $main.style.display = 'block';
    $main.innerHTML = `
      <div class="not-found">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2m1-7h.01M17 9h.01"/>
        </svg>
        <p>${escapeHTML(msg)}</p>
        <a href="./">返回主题列表</a>
      </div>
    `;
  }

  /* 启动 */
  init();
})();
