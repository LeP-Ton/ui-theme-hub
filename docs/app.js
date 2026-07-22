/**
 * UI Theme Hub 交互逻辑
 * 负责数据加载、筛选/搜索、卡片渲染
 *
 * URL 参数规范（query string）：
 *   scene=enterprise          按场景筛选
 *   tags=blue,management      按标签筛选（逗号分隔）
 *   q=搜索词                  搜索回填
 *   installed=apple-theme,boss-theme-blue  已下载主题 ID（逗号分隔）
 *
 * 示例：?scene=enterprise&tags=blue&q=管理&installed=apple-theme,boss-theme-blue
 */
(function () {
  'use strict';

  /* ========== 状态管理 ========== */
  const state = {
    themes: [],          /* 轻量主题数据（来自 themes-summary.json） */
    sceneLabels: {},     /* scene 中文映射（来自 themes-summary.json） */
    activeScene: null,   /* 当前选中的 scene，null 表示全部 */
    activeTags: new Set(), /* 当前选中的 tag 集合 */
    searchQuery: '',     /* 搜索关键字（原始输入） */
    installedIds: new Set(), /* URL 中声明的已下载主题 ID */
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
      const res = await fetch('./themes-summary.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      state.themes = data.themes || [];
      state.sceneLabels = data.sceneLabels || {};
    } catch (err) {
      console.error('加载主题数据失败:', err);
      $grid.innerHTML = renderEmptyState('无法加载主题数据，请刷新重试');
      return;
    }

    renderFilterChips();
    parseURLParams();
    bindEvents();
    render();
  }

  /* ========== 筛选标签渲染 ========== */
  function renderFilterChips() {
    const scenes = [...new Set(state.themes.map(t => t.scene))].sort();
    const tags = [...new Set(state.themes.flatMap(t => t.tags))].sort();

    $sceneChips.innerHTML = scenes.map(scene => `
      <button class="filter-chip scene-chip" data-scene="${scene}" data-type="scene">
        ${sceneLabel(scene)}
      </button>
    `).join('');

    $tagChips.innerHTML = tags.map(tag => `
      <button class="filter-chip tag-chip" data-tag="${tag}" data-type="tag">
        ${tag}
      </button>
    `).join('');
  }

  /* scene 显示名称：从构建产物 sceneLabels 映射，未匹配时回退为原始值 */
  function sceneLabel(scene) {
    return state.sceneLabels[scene] || scene;
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
      updateURLParams();
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
      updateURLParams();
    });

    /* 搜索输入（200ms 防抖，忽略 IME 组合中的输入） */
    let debounceTimer = null;
    let isComposing = false;
    $searchInput.addEventListener('compositionstart', () => { isComposing = true; });
    $searchInput.addEventListener('compositionend', () => {
      isComposing = false;
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
        updateURLParams();
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
      updateURLParams();
    });

    /* 浏览器前进/后退 */
    window.addEventListener('popstate', () => {
      state.activeScene = null;
      state.activeTags.clear();
      state.searchQuery = '';
      $searchInput.value = '';
      parseURLParams();
      render();
    });

    /* 下载按钮：下载主题 zip 包 */
    $grid.addEventListener('click', (e) => {
      const btn = e.target.closest('.card-install-btn');
      if (!btn) return;

      e.stopPropagation();
      const themeId = btn.dataset.themeId;
      /* 下载主题 zip 包，用户自行放置到目标目录 */
      const ts = Date.now();
      const a = document.createElement('a');
      a.href = 'packages/' + themeId + '.zip';
      a.download = themeId + '-' + ts + '.zip';
      a.click();
      showToast('已下载 ' + themeId + '，解压后放置到目标目录即可');
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
    const hasFilter = state.activeScene || state.activeTags.size > 0 || state.searchQuery;
    $clearFilters.style.display = hasFilter ? 'block' : 'none';
  }

  /* ========== 筛选 + 排序逻辑 ========== */
  function getFilteredThemes() {
    const filtered = state.themes.filter(theme => {
      /* scene 筛选 */
      if (state.activeScene && theme.scene !== state.activeScene) return false;

      /* tag 筛选（AND 逻辑：必须包含所有选中标签） */
      if (state.activeTags.size > 0) {
        for (const tag of state.activeTags) {
          if (!theme.tags.includes(tag)) return false;
        }
      }

      /* 搜索筛选（匹配 name、id、description、author、scene、tags，大小写不敏感） */
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        const haystack = [
          theme.name,
          theme.dir,
          theme.description,
          theme.author,
          theme.scene,
          ...theme.tags,
        ].join(' ').toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });

    /* 排序：已下载主题排在前面 */
    filtered.sort((a, b) => {
      const aInstalled = state.installedIds.has(a.dir) ? 0 : 1;
      const bInstalled = state.installedIds.has(b.dir) ? 0 : 1;
      return aInstalled - bInstalled;
    });

    return filtered;
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
    const themeId = theme.dir;
    const isInstalled = state.installedIds.has(themeId);

    const primary = theme.primaryColor || '#6366f1';
    const secondary = theme.secondaryColor || '#818cf8';
    const accent = theme.accentColor || '#a78bfa';

    /* 预览区域 */
    const preview = theme.previews.length > 0
      ? renderPreviewImages(theme)
      : renderPreviewFallback(theme, primary, secondary, accent);

    /* 已下载标记 */
    const installedBadge = isInstalled
      ? '<span class="installed-badge">已下载</span>'
      : '';

    /* scene 徽章 */
    const sceneBadge = `<span class="card-scene scene-${theme.scene}">${sceneLabel(theme.scene)}</span>`;

    /* 色彩圆点 */
    const colorDots = [primary, secondary, accent].map(c =>
      `<span class="color-dot" style="background:${c}" title="${c}"></span>`
    ).join('');

    /* tags */
    const tags = theme.tags.map(t => `<span class="tag">${t}</span>`).join('');

    return `
      <article class="theme-card${isInstalled ? ' installed' : ''}" data-theme-id="${escapeHTML(themeId)}" data-scene="${theme.scene}" data-tags="${theme.tags.join(',')}">
        ${preview}
        <div class="card-body">
          <div class="card-header">
            <h2 class="card-name">${escapeHTML(theme.name)}</h2>
            <div class="card-info">
              <span class="card-version">v${escapeHTML(theme.version)}</span>
              ${installedBadge}
            </div>
          </div>
          <p class="card-description">${escapeHTML(theme.description)}</p>
          <div class="card-meta">
            ${sceneBadge}
            <div class="card-colors">${colorDots}</div>
          </div>
          <div class="card-tags">${tags}</div>
          <div class="card-footer">
            <span class="card-author">by ${escapeHTML(theme.author)}</span>
            <div class="card-actions">
              <button class="card-install-btn" data-theme-id="${escapeHTML(themeId)}" title="下载主题">⬇ 下载主题</button>
              <span class="card-action-sep">|</span>
              <a class="card-link" href="detail.html?theme=${encodeURIComponent(theme.dir)}${isInstalled ? '&installed=1' : ''}">查看详情 →</a>
            </div>
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

  /* 轻量 Toast 提示 */
  function showToast(message, duration = 2500) {
    /* 复用或创建 toast 容器 */
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('visible'), duration);
  }

  /* ========== URL 参数同步 ========== */

  /**
   * 写入 URL query string（不刷新页面）
   * 保留 installed 参数不被用户交互覆盖
   */
  function updateURLParams() {
    const params = new URLSearchParams(window.location.search);

    /* 保留 installed 参数 */
    const installedParam = params.get('installed');

    /* 重建参数 */
    const newParams = new URLSearchParams();
    if (state.activeScene) newParams.set('scene', state.activeScene);
    if (state.activeTags.size > 0) newParams.set('tags', [...state.activeTags].join(','));
    if (state.searchQuery) newParams.set('q', state.searchQuery);
    if (installedParam) newParams.set('installed', installedParam);

    const search = newParams.toString();
    const newUrl = window.location.pathname + (search ? '?' + search : '') + window.location.hash;
    window.history.replaceState(null, '', newUrl);
  }

  /**
   * 从 URL query string 读取筛选/搜索/installed 参数
   * 支持 ui-design-skill 拼接的链接直接激活筛选状态
   */
  function parseURLParams() {
    const params = new URLSearchParams(window.location.search);

    /* scene 筛选 */
    if (params.has('scene')) {
      state.activeScene = params.get('scene');
    }

    /* tags 筛选 */
    if (params.has('tags')) {
      params.get('tags').split(',').filter(Boolean).forEach(t => state.activeTags.add(t));
    }

    /* 搜索关键词：回填搜索框 */
    if (params.has('q')) {
      state.searchQuery = params.get('q');
      $searchInput.value = params.get('q');
    }

    /* 已下载主题 ID */
    if (params.has('installed')) {
      params.get('installed').split(',').filter(Boolean).forEach(id => state.installedIds.add(id));
    }

    syncChipsUI();
  }

  /* 启动 */
  init();
})();
