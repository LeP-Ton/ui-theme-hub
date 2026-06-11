/**
 * UI Theme Hub 交互逻辑
 * 负责数据加载、筛选/搜索、卡片渲染
 */
(function () {
  'use strict';

  /* ========== 状态管理 ========== */
  const state = {
    themes: [],          /* 全量主题数据 */
    activeScene: null,   /* 当前选中的 scene，null 表示全部 */
    activeTags: new Set(), /* 当前选中的 tag 集合 */
    searchQuery: '',     /* 搜索关键字（小写） */
  };

  /* ========== DOM 引用 ========== */
  const $grid = document.getElementById('theme-grid');
  const $sceneChips = document.getElementById('scene-chips');
  const $tagChips = document.getElementById('tag-chips');
  const $searchInput = document.getElementById('search-input');
  const $clearFilters = document.getElementById('clear-filters');

  /* ========== 初始化 ========== */
  async function init() {
    try {
      const res = await fetch('./themes-index.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      state.themes = data.themes || [];
    } catch (err) {
      console.error('加载主题数据失败:', err);
      $grid.innerHTML = renderEmptyState('无法加载主题数据，请刷新重试');
      return;
    }

    renderFilterChips();
    parseURLHash();
    bindEvents();
    render();
  }

  /* ========== 筛选标签渲染 ========== */
  function renderFilterChips() {
    /* 提取所有 scene 和 tag */
    const scenes = [...new Set(state.themes.map(t => t.scene))].sort();
    const tags = [...new Set(state.themes.flatMap(t => t.tags))].sort();

    /* 渲染 scene 标签 */
    $sceneChips.innerHTML = scenes.map(scene => `
      <button class="filter-chip scene-chip" data-scene="${scene}" data-type="scene">
        ${sceneLabel(scene)}
      </button>
    `).join('');

    /* 渲染 tag 标签 */
    $tagChips.innerHTML = tags.map(tag => `
      <button class="filter-chip tag-chip" data-tag="${tag}" data-type="tag">
        ${tag}
      </button>
    `).join('');
  }

  /* scene 显示名称映射 */
  function sceneLabel(scene) {
    const map = { 'c-end': 'C端', 'enterprise': '企业级', 'game': '游戏' };
    return map[scene] || scene;
  }

  /* ========== 事件绑定 ========== */
  function bindEvents() {
    /* scene 标签点击 */
    $sceneChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.scene-chip');
      if (!chip) return;
      const scene = chip.dataset.scene;
      state.activeScene = state.activeScene === scene ? null : scene;
      syncChipsUI();
      render();
      updateURLHash();
    });

    /* tag 标签点击 */
    $tagChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.tag-chip');
      if (!chip) return;
      const tag = chip.dataset.tag;
      if (state.activeTags.has(tag)) {
        state.activeTags.delete(tag);
      } else {
        state.activeTags.add(tag);
      }
      syncChipsUI();
      render();
      updateURLHash();
    });

    /* 搜索输入（200ms 防抖，忽略 IME 组合中的输入） */
    let debounceTimer = null;
    let isComposing = false;
    $searchInput.addEventListener('compositionstart', () => { isComposing = true; });
    $searchInput.addEventListener('compositionend', () => {
      isComposing = false;
      /* 组合结束后立即触发一次搜索 */
      handleSearchInput();
    });
    $searchInput.addEventListener('input', () => {
      if (isComposing) return;
      handleSearchInput();
    });

    function handleSearchInput() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.searchQuery = $searchInput.value.trim();
        render();
        updateURLHash();
      }, 200);
    }

    /* 清除筛选 */
    $clearFilters.addEventListener('click', () => {
      state.activeScene = null;
      state.activeTags.clear();
      state.searchQuery = '';
      $searchInput.value = '';
      syncChipsUI();
      render();
      updateURLHash();
    });
  }

  /* 同步标签 UI 状态 */
  function syncChipsUI() {
    $sceneChips.querySelectorAll('.scene-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.scene === state.activeScene);
    });
    $tagChips.querySelectorAll('.tag-chip').forEach(chip => {
      chip.classList.toggle('active', state.activeTags.has(chip.dataset.tag));
    });
    /* 是否显示"清除筛选"按钮 */
    const hasFilter = state.activeScene || state.activeTags.size > 0 || state.searchQuery;
    $clearFilters.style.display = hasFilter ? 'inline-flex' : 'none';
  }

  /* ========== 筛选逻辑 ========== */
  function getFilteredThemes() {
    return state.themes.filter(theme => {
      /* scene 筛选 */
      if (state.activeScene && theme.scene !== state.activeScene) return false;

      /* tag 筛选（AND 逻辑：必须包含所有选中标签） */
      if (state.activeTags.size > 0) {
        for (const tag of state.activeTags) {
          if (!theme.tags.includes(tag)) return false;
        }
      }

      /* 搜索筛选（匹配 name、description、author、scene、tags，大小写不敏感） */
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        const haystack = [
          theme.name,
          theme.description,
          theme.author,
          theme.scene,
          ...theme.tags,
        ].join(' ').toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }

  /* ========== 渲染 ========== */
  function render() {
    const filtered = getFilteredThemes();

    if (filtered.length === 0) {
      $grid.innerHTML = renderEmptyState('没有找到匹配的主题');
      return;
    }

    $grid.innerHTML = filtered.map(theme => renderCard(theme)).join('');
  }

  /* 渲染单个卡片 */
  function renderCard(theme) {
    const colors = theme.tokens?.color || {};
    const primary = colors.primary || '#6366f1';
    const secondary = colors.secondary || '#818cf8';
    const accent = colors.accent || '#a78bfa';

    /* 预览区域 */
    const preview = theme.previews.length > 0
      ? renderPreviewImages(theme)
      : renderPreviewFallback(theme, primary, secondary, accent);

    /* scene 徽章 */
    const sceneBadge = `<span class="card-scene scene-${theme.scene}">${sceneLabel(theme.scene)}</span>`;

    /* 色彩圆点 */
    const colorDots = [primary, secondary, accent].map(c =>
      `<span class="color-dot" style="background:${c}" title="${c}"></span>`
    ).join('');

    /* tags */
    const tags = theme.tags.map(t => `<span class="tag">${t}</span>`).join('');

    return `
      <article class="theme-card" data-scene="${theme.scene}" data-tags="${theme.tags.join(',')}">
        ${preview}
        <div class="card-body">
          <div class="card-header">
            <h2 class="card-name">${escapeHTML(theme.name)}</h2>
            <span class="card-version">v${escapeHTML(theme.version)}</span>
          </div>
          <p class="card-description">${escapeHTML(theme.description)}</p>
          <div class="card-meta">
            ${sceneBadge}
            <div class="card-colors">${colorDots}</div>
          </div>
          <div class="card-tags">${tags}</div>
          <div class="card-footer">
            <span class="card-author">by ${escapeHTML(theme.author)}</span>
            <a class="card-link" href="../${theme.dir}/">查看详情</a>
          </div>
        </div>
      </article>
    `;
  }

  /* 渲染预览图片（多图水平滚动） */
  function renderPreviewImages(theme) {
    const scrollable = theme.previews.length > 1 ? ' scrollable' : '';
    const images = theme.previews.map(src =>
      `<img src="${src}" alt="${theme.name} 预览" loading="lazy" onerror="this.style.display='none'">`
    ).join('');

    const indicator = theme.previews.length > 1
      ? `<span class="scroll-indicator">${theme.previews.length} 张</span>`
      : '';

    return `<div class="card-preview${scrollable}">${images}${indicator}</div>`;
  }

  /* 渲染无图时的色彩氛围 fallback */
  function renderPreviewFallback(theme, primary, secondary, accent) {
    return `
      <div class="card-preview">
        <div class="preview-fallback" style="
          background: linear-gradient(135deg, ${primary}22 0%, ${secondary}22 50%, ${accent}22 100%);
          border-bottom: 3px solid ${primary};
        ">
          <span class="fallback-name" style="color: ${primary}">${escapeHTML(theme.name)}</span>
          <div class="fallback-colors">
            <span style="background:${primary}" title="primary: ${primary}"></span>
            <span style="background:${secondary}" title="secondary: ${secondary}"></span>
            <span style="background:${accent}" title="accent: ${accent}"></span>
          </div>
        </div>
      </div>
    `;
  }

  /* 空状态 */
  function renderEmptyState(message) {
    return `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <p>${escapeHTML(message)}</p>
      </div>
    `;
  }

  /* HTML 转义 */
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ========== URL Hash 同步 ========== */
  function updateURLHash() {
    const params = [];
    if (state.activeScene) params.push(`scene=${encodeURIComponent(state.activeScene)}`);
    if (state.activeTags.size > 0) params.push(`tags=${encodeURIComponent([...state.activeTags].join(','))}`);
    if (state.searchQuery) params.push(`q=${encodeURIComponent(state.searchQuery)}`);
    window.location.hash = params.length ? params.join('&') : '';
  }

  function parseURLHash() {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    const params = new URLSearchParams(hash);
    if (params.has('scene')) state.activeScene = params.get('scene');
    if (params.has('tags')) {
      params.get('tags').split(',').filter(Boolean).forEach(t => state.activeTags.add(t));
    }
    if (params.has('q')) {
      state.searchQuery = params.get('q');
      $searchInput.value = params.get('q');
    }

    syncChipsUI();
  }

  /* 监听浏览器前进/后退 */
  window.addEventListener('hashchange', () => {
    state.activeScene = null;
    state.activeTags.clear();
    state.searchQuery = '';
    $searchInput.value = '';
    parseURLHash();
    render();
  });

  /* 启动 */
  init();
})();
