# 下载按钮样式调整：纯文字风格 + 详情页同行右侧

## 背景与目标
- "下载安装包"改为"下载主题"，按钮去掉边框，与"查看详情"保持一致的无边框纯文字风格
- 详情页"下载主题"按钮与主题名同行，靠最右侧

## 方案
1. 主页卡片：`.card-install-btn` 去掉 border/border-radius/padding，改为和 `.card-link` 一致的纯文字链接样式
2. 详情页：下载按钮从 `.detail-actions` 移到 `.detail-header` 行内，`margin-left: auto` 推到最右
3. 删除 `.detail-actions` 容器和旧样式

## 代码变更
- docs/app.js（按钮文字改"下载主题"）
```diff
-              <button class="card-install-btn" ...>下载安装包</button>
+              <button class="card-install-btn" ...>下载主题</button>
```

- docs/style.css（主页卡片下载按钮样式）
```diff
 .card-install-btn {
-  font-size: 12px;
-  padding: 3px 10px;
-  border-radius: 6px;
-  border: 1px solid var(--accent);
-  background: transparent;
+  font-size: 13px;
+  padding: 0;
+  border: none;
+  background: none;
   color: var(--accent);
   cursor: pointer;
   font-weight: 500;
   white-space: nowrap;
-  transition: all 0.15s;
+  transition: opacity 0.15s;
 }

 .card-install-btn:hover {
-  background: var(--accent);
-  color: #fff;
+  opacity: 0.8;
 }
```

- docs/detail.js（下载按钮移入 detail-header 行内）
```diff
 <div class="detail-header">
   <h1 class="detail-name">...</h1>
   <span class="detail-version">...</span>
   ${isInstalled ? '...' : ''}
+  <button class="detail-install-btn" ...>下载主题</button>
 </div>
-<div class="detail-actions">
-  <button class="detail-install-btn" ...>下载安装包</button>
-</div>
```

- docs/detail.css（新增 .detail-install-btn 样式，删除 .detail-actions 和旧按钮样式）
```diff
 .detail-header {
   display: flex;
   align-items: baseline;
   gap: 12px;
   margin-bottom: 12px;
 }
+
+.detail-name {
+  font-size: 24px;
+  font-weight: 700;
+}
+
+.detail-install-btn {
+  margin-left: auto;
+  padding: 0;
+  border: none;
+  background: none;
+  color: var(--accent);
+  font-size: 14px;
+  font-weight: 500;
+  cursor: pointer;
+  white-space: nowrap;
+  transition: opacity 0.15s;
+}
+
+.detail-install-btn:hover {
+  opacity: 0.8;
+}
```

（删除 .detail-actions、旧 .detail-install-btn 及其 ::before 伪元素）
