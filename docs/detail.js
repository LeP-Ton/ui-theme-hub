/**
 * 主题详情页交互逻辑
 * 通过 URL 参数 ?theme=xxx 加载对应主题的完整信息
 * 支持 Pattern 的源码/预览模式切换
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
    const isInstalled = params.has('installed');

    if (!themeName) {
      showNotFound('缺少主题参数');
      return;
    }

    let theme;
    try {
      const res = await fetch(`./themes/${encodeURIComponent(themeName)}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      theme = await res.json();
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
    renderDetail(theme, isInstalled);

    $loading.style.display = 'none';
    $main.style.display = 'block';
  }

  /* ========== 渲染详情页 ========== */
  function renderDetail(theme, isInstalled) {
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

    /* patterns 区块 */
    const patternsSection = theme.patterns
      ? renderPatternsSection(theme.patterns)
      : '';

    $main.innerHTML = `
      <div class="detail-hero">
        ${previewArea}
        <div class="detail-info">
          <div class="detail-header">
            <h1 class="detail-name">${escapeHTML(theme.name)}</h1>
            <span class="detail-version">v${escapeHTML(theme.version)}</span>
            ${isInstalled ? '<span class="detail-installed-badge">已下载</span>' : ''}
            <button class="detail-install-btn" data-theme-id="${escapeHTML(theme.dir)}">⬇ 下载主题</button>
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
      ${patternsSection}
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

    /* 绑定下载按钮：下载主题 zip 包 */
    $main.querySelectorAll('.detail-install-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const themeId = btn.dataset.themeId;
        const ts = Date.now();
        const a = document.createElement('a');
        a.href = 'packages/' + themeId + '.zip';
        a.download = themeId + '-' + ts + '.zip';
        a.click();
      });
    });

    /* 绑定 pattern 模式切换 */
    bindPatternModeSwitch();
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
    const semanticKeys = ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'info'];
    const semanticItems = semanticKeys
      .filter(k => color[k])
      .map(k => renderColorItem(k, color[k]));

    const bgItems = color.background
      ? flattenObj(color.background, 'bg').map(([k, v]) => renderColorItem(k, v))
      : [];

    const textItems = color.text
      ? flattenObj(color.text, 'text').map(([k, v]) => renderColorItem(k, v))
      : [];

    const borderItems = color.border
      ? flattenObj(color.border, 'border').map(([k, v]) => renderColorItem(k, v))
      : [];

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

  /* ========== Patterns 区块渲染 ========== */

  function renderPatternsSection(patterns) {
    const hasPages = patterns.pages && patterns.pages.length > 0;
    const hasComponents = patterns.components && patterns.components.length > 0;
    if (!hasPages && !hasComponents) return '';

    const pagesHTML = hasPages
      ? renderPatternGroup('页面模板', 'pages', patterns.pages)
      : '';
    const componentsHTML = hasComponents
      ? renderPatternGroup('组件', 'components', patterns.components)
      : '';

    return `
      <div class="token-section">
        <div class="token-section-title">
          模式 (Patterns)
          <span class="toggle-icon">▼</span>
        </div>
        <div class="token-section-body">
          ${pagesHTML}
          ${componentsHTML}
        </div>
      </div>
    `;
  }

  /* 渲染一组 patterns */
  function renderPatternGroup(label, groupKey, items) {
    const list = items.map((item, idx) => {
      /* 默认展示预览模式（有 preview 时） */
      const hasPreview = !!item.preview;
      const defaultMode = hasPreview ? 'preview' : 'source';

      return `
        <div class="pattern-item" data-group="${groupKey}" data-index="${idx}" data-mode="${defaultMode}">
          <div class="pattern-item-header">
            <span class="pattern-item-name">${escapeHTML(formatPatternName(item.name))}</span>
            <span class="pattern-item-file">${escapeHTML(item.file)}</span>
            <div class="pattern-mode-switch">
              ${hasPreview ? `
                <button class="mode-btn mode-btn-preview ${defaultMode === 'preview' ? 'active' : ''}"
                        data-mode="preview" title="预览模式">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>
                  预览
                </button>
                <button class="mode-btn mode-btn-source ${defaultMode === 'source' ? 'active' : ''}"
                        data-mode="source" title="源码模式">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                  源码
                </button>
              ` : ''}
            </div>
            <span class="pattern-item-toggle">展开</span>
          </div>
          <div class="pattern-item-content" style="display:none;">
            ${hasPreview ? `
              <div class="pattern-preview-container" style="${defaultMode === 'preview' ? '' : 'display:none;'}">
                <iframe class="pattern-iframe" src="${escapeHTML(item.preview)}" loading="lazy"></iframe>
              </div>
            ` : ''}
            <div class="pattern-source-container" style="${defaultMode === 'source' ? '' : 'display:none;'}">
              <pre><code>${escapeHTML(item.source)}</code></pre>
            </div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="pattern-group">
        <h3 class="pattern-group-title">${label} (${items.length})</h3>
        <div class="pattern-list">${list}</div>
      </div>
    `;
  }

  /* 格式化 pattern 名称 */
  function formatPatternName(name) {
    return name
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  /* ========== Pattern 模式切换事件绑定 ========== */

  function bindPatternModeSwitch() {
    /* 展开/折叠 */
    $main.querySelectorAll('.pattern-item-header').forEach(header => {
      header.addEventListener('click', (e) => {
        /* 如果点击的是模式切换按钮，不触发折叠 */
        if (e.target.closest('.pattern-mode-switch')) return;

        const content = header.nextElementSibling;
        const toggle = header.querySelector('.pattern-item-toggle');
        const isOpen = content.style.display !== 'none';
        content.style.display = isOpen ? 'none' : 'block';
        toggle.textContent = isOpen ? '展开' : '收起';

        /* 展开时自动调整 iframe 高度 */
        if (!isOpen) {
          requestAnimationFrame(() => adjustIframeHeight(content));
        }
      });
    });

    /* 模式切换按钮 */
    $main.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const mode = btn.dataset.mode;
        const item = btn.closest('.pattern-item');
        const currentMode = item.dataset.mode;

        if (currentMode === mode) return;
        item.dataset.mode = mode;

        /* 更新按钮状态 */
        item.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        /* 切换显示区域 */
        const previewContainer = item.querySelector('.pattern-preview-container');
        const sourceContainer = item.querySelector('.pattern-source-container');

        if (previewContainer) {
          previewContainer.style.display = mode === 'preview' ? '' : 'none';
        }
        if (sourceContainer) {
          sourceContainer.style.display = mode === 'source' ? '' : 'none';
        }
      });
    });

    /* iframe 加载后自动调整高度 */
    $main.querySelectorAll('.pattern-iframe').forEach(iframe => {
      iframe.addEventListener('load', () => {
        const container = iframe.closest('.pattern-item-content');
        if (container && container.style.display !== 'none') {
          adjustIframeHeight(container);
        }
      });
    });
  }

  /* 自动调整 iframe 高度以适配内容 */
  function adjustIframeHeight(container) {
    const iframe = container.querySelector('.pattern-iframe');
    if (!iframe) return;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc && doc.body) {
        const height = doc.body.scrollHeight;
        /* 限制最大高度 */
        iframe.style.height = Math.min(Math.max(height, 200), 800) + 'px';
      }
    } catch (e) {
      /* 跨域 iframe 无法读取内容，使用默认高度 */
      iframe.style.height = '480px';
    }
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
