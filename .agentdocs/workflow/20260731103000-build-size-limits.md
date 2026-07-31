# 构建期大小评估：防止主题无限膨胀

## 背景与目标
- ui-theme-hub 部署在 GitHub Pages，主题数量会持续增长，需在编译期评估上下文占用和单文件大小，防止无限膨胀。
- ui-design-skill 的真实上下文消费链路（经 SKILL.md 确认）：
  - Phase 1 场景识别：远程读 `themes-summary.json`（每次必读）→ 决定主题总数上限
  - Phase 2 主题加载：下载 zip 解压到本地后，按需读 `theme.json` / `patterns/*.tsx` / `standards/*.md`
  - 故源文件（进 AI 上下文）需卡紧，编译产物（展示/传输用）防失控即可
- 目标：在 `build-index.js` 编译流程中落地大小评估，超限即 fail build（硬中断）。

## 约束与原则
- 阈值集中配置在 `theme.config.json` 的 `sizeLimits` 字段，不散落在脚本里。
- 现状全部通过（阈值按现状最大值留 1.7×~4.4× 余量设定），不卡住当前主题。
- 超限不立即抛错，统一收集到 `sizeViolations`，一次构建暴露全部问题后统一 fail build。
- 评估覆盖三类对象：源文件（进上下文）、编译产物（展示/传输）、聚合索引。

## 阈值设定依据
| 对象 | 现状最大 | 阈值 | 余量 | 字段 |
|------|---------|------|------|------|
| theme.json | 3.4K | 8K | 2.3× | `source.themeJson` |
| patterns/*.tsx | 7.2K | 12K | 1.7× | `source.patternTsx` |
| standards/*.md | 4.5K | 8K | 1.8× | `source.standardMd` |
| 单主题上下文总和 | 18K | 80K | 4.4× | `source.themeContextTotal` |
| themes-summary.json | 4.3K | 64K | ~50 主题空间 | `source.summaryJson` |
| pattern-preview HTML | 1.25M | 2M | 防失控 | `output.patternPreviewHtml` |
| 预览图 | 2.9M | 4M | 防失控 | `output.previewImage` |
| zip 包 | 9.5K | 200K | 预留 assets | `output.themeZip` |

## 阶段与 TODO
- [x] 确认 ui-design-skill 真实上下文消费链路（读 SKILL.md）
- [x] 盘点现状各文件最大值，确定阈值
- [x] `theme.config.json` 新增 `sizeLimits` 配置
- [x] `build-index.js` 新增 `assertSize` 断言函数 + `sizeViolations` 收集器
- [x] 在 theme.json / patterns / standards / 产物 / summary 各环节接入断言
- [x] 新增单主题上下文总和聚合评估（theme.json + 所有 tsx + 所有 md）
- [x] main() 结尾 fail build 判定 + 修复指引
- [x] 验证现状通过 + 超限 fail build 生效（退出码 1）
- [x] 更新 index.md 与 AGENTS.md

## 关键风险
- 阈值过严会卡住正常主题迭代：已按现状最大值留余量，并通过实测验证现状全过。
- `standards/` 此前构建未扫描，本次新增扫描逻辑并将其纳入 zip 与 detail.json；需确认 detail 页面不会因多出 `standards`/`contextBytes` 字段而出错（detail.json 本就透传主题对象，新字段对前端透明）。
- antd 全量内联导致 pattern-preview HTML 偏大（现状 1.25M），阈值 2M 仅作防失控兜底，未根治；后续如需根治应改 externals + CDN，属独立任务。

## 当前进展
- `theme.config.json` 新增 `sizeLimits`（source + output 两组共 8 个阈值）。
- `build-index.js` 新增大小评估段落、`assertSize` 函数、`sizeViolations` 收集器，并在 7 处接入断言。
- 新增 `standards/` 扫描逻辑（此前缺失），主题对象新增 `standards` 与 `contextBytes` 字段。
- main() 末尾新增汇总判定：有 violation → `process.exit(1)` + 修复指引；无则打印通过。
- 实测：现状构建通过（退出码 0）；造 13K 超限 tsx 后构建中断（退出码 1）并打印明细。

## 代码变更

### theme.config.json +14
```diff
 {
   "sceneLabels": {
     "c-end": "C端",
     "enterprise": "企业级",
     "game": "游戏",
     "presentation": "演讲"
-  }
+  },
+  "sizeLimits": {
+    "source": {
+      "themeJson": 8192,
+      "patternTsx": 12288,
+      "standardMd": 8192,
+      "themeContextTotal": 81920,
+      "summaryJson": 65536
+    },
+    "output": {
+      "patternPreviewHtml": 2097152,
+      "previewImage": 4194304,
+      "themeZip": 204800
+    }
+  }
 }
```

### scripts/build-index.js
新增配置读取与大小评估段落（+39）：
```diff
 const SCENE_LABELS = config.sceneLabels || {};

+/* ========== 大小评估（防止主题无限膨胀） ==========
+ *
+ * 设计依据：ui-design-skill 的真实上下文消费链路
+ * - Phase 1 场景识别：远程读 themes-summary.json（每次必读）→ 决定主题总数上限
+ * - Phase 2 主题加载：下载 zip 解压到本地后，按需读 theme.json / patterns/*.tsx / standards/*.md
+ * - 故源文件（进 AI 上下文）卡紧，编译产物（展示/传输用）防失控即可
+ *
+ * 超限处理：统一收集到 violations，main() 结束时若有任何 violation → process.exit(1) 中断构建
+ */
+const SIZE_LIMITS = config.sizeLimits || {};
+const SOURCE_LIMITS = SIZE_LIMITS.source || {};
+const OUTPUT_LIMITS = SIZE_LIMITS.output || {};
+
+/* 违规收集器：构建过程中累计所有超限项，最后统一判定是否 fail build */
+const sizeViolations = [];
+
+/**
+ * 单文件大小断言：超限则记入 violations（不立即抛错，保证一次构建暴露全部问题）
+ *
+ * @param {string} filePath - 文件路径，用于报错定位
+ * @param {number} size     - 文件字节数
+ * @param {number} limit    - 上限字节数
+ * @param {string} label    - 人类可读的文件类别描述（如"主题 JSON"/"Pattern 模板"）
+ */
+function assertSize(filePath, size, limit, label) {
+  if (limit == null || typeof limit !== 'number') return; /* 未配置上限则跳过 */
+  if (size <= limit) return;
+  const sizeKb = (size / 1024).toFixed(1);
+  const limitKb = (limit / 1024).toFixed(1);
+  sizeViolations.push({
+    filePath,
+    label,
+    size,
+    limit,
+    message: `${label}超限: ${filePath} (${sizeKb}KB > ${limitKb}KB 上限)`,
+  });
+  console.error(`   ✗ ${label}超限: ${sizeKb}KB > ${limitKb}KB  ${filePath}`);
+}
+
 /* ========== 主题格式校验 ========== */
```

theme.json 读取接入断言（+3）：
```diff
-    const themeData = JSON.parse(fs.readFileSync(themeJsonPath, 'utf-8'));
+    const themeJsonRaw = fs.readFileSync(themeJsonPath, 'utf-8');
+    /* 评估 theme.json 大小（进 AI 上下文的核心文件，超限记入 violations） */
+    assertSize(themeJsonPath, Buffer.byteLength(themeJsonRaw), SOURCE_LIMITS.themeJson, '主题 JSON');
+    const themeData = JSON.parse(themeJsonRaw);
```

patterns 读取接入断言（+2）：
```diff
         const name = path.basename(file, TSX_EXT);
         const tsxPath = path.join(dir, file);
         const sourceCode = fs.readFileSync(tsxPath, 'utf-8');
+        /* 评估 pattern 源文件大小（进 AI 上下文的代码模板） */
+        assertSize(tsxPath, Buffer.byteLength(sourceCode), SOURCE_LIMITS.patternTsx, 'Pattern 模板');
```

pattern-preview HTML 写入后接入断言（+2）：
```diff
           const outputPath = path.join(outputDir, `${name}.html`);
           fs.writeFileSync(outputPath, html);
+          /* 评估编译产物 HTML 大小（展示用，不进 AI 上下文，防 antd 全量内联等失控） */
+          assertSize(outputPath, Buffer.byteLength(html), OUTPUT_LIMITS.patternPreviewHtml, 'Pattern 预览 HTML');
           previewPath = `pattern-previews/${entry.name}/${key}/${name}.html`;
```

预览图复制后接入断言（+3）：
```diff
         if (IMAGE_EXTS.has(ext)) {
-          fs.copyFileSync(
-            path.join(previewDir, file),
-            path.join(themeOutputDir, file)
-          );
+          const srcImgPath = path.join(previewDir, file);
+          const destImgPath = path.join(themeOutputDir, file);
+          fs.copyFileSync(srcImgPath, destImgPath);
+          /* 评估预览图大小（展示用，不进 AI 上下文，防未压缩大图撑爆仓库） */
+          assertSize(srcImgPath, fs.statSync(srcImgPath).size, OUTPUT_LIMITS.previewImage, '预览图');
           previews.push(`theme-previews/${entry.name}/${file}`);
         }
```

新增 standards 扫描 + 单主题上下文总和评估，并扩展 themes.push（+34）：
```diff
+    /* 扫描 standards/ 目录中的设计规范 Markdown（打包进 zip 供 AI 按需读取） */
+    const standards = [];
+    const standardsDir = path.join(THEMES_DIR, entry.name, 'standards');
+    if (fs.existsSync(standardsDir)) {
+      for (const file of fs.readdirSync(standardsDir).sort()) {
+        if (path.extname(file).toLowerCase() !== '.md') continue;
+        const mdPath = path.join(standardsDir, file);
+        const mdContent = fs.readFileSync(mdPath, 'utf-8');
+        /* 评估 standards 源文件大小（进 AI 上下文的设计规范） */
+        assertSize(mdPath, Buffer.byteLength(mdContent), SOURCE_LIMITS.standardMd, '设计规范');
+        standards.push({ name: path.basename(file, '.md'), file, source: mdContent });
+      }
+    }
+
+    /* 评估单主题上下文总和：theme.json + 所有 patterns/*.tsx + 所有 standards/*.md
+     * 即 ui-design-skill 最坏情况下完整加载一个主题时占用的上下文字节数 */
+    const contextBytes =
+      Buffer.byteLength(themeJsonRaw) +
+      [...patterns.pages, ...patterns.components].reduce(
+        (sum, p) => sum + Buffer.byteLength(p.source),
+        0
+      ) +
+      standards.reduce((sum, s) => sum + Buffer.byteLength(s.source), 0);
+    assertSize(
+      path.join(THEMES_DIR, entry.name),
+      contextBytes,
+      SOURCE_LIMITS.themeContextTotal,
+      '单主题上下文总和'
+    );
+
     themes.push({
       dir: entry.name,
       ...themeData,
       previews,
       patterns,
+      standards,
+      contextBytes,
     });
```

summary.json 写入后接入断言（+3）：
```diff
   const summaryPath = path.join(DOCS_DIR, 'themes-summary.json');
-  fs.writeFileSync(summaryPath, JSON.stringify(summaryOutput, null, 2) + '\n');
+  const summaryContent = JSON.stringify(summaryOutput, null, 2) + '\n';
+  fs.writeFileSync(summaryPath, summaryContent);
+  /* 评估 themes-summary.json 大小（Phase 1 场景识别每次必读，决定主题总数天花板） */
+  assertSize(summaryPath, Buffer.byteLength(summaryContent), SOURCE_LIMITS.summaryJson, '主题轻量索引');
```

zip 打包后接入断言（+3）：
```diff
-      const size = (fs.statSync(zipPath).size / 1024).toFixed(0);
+      const zipSize = fs.statSync(zipPath).size;
+      /* 评估主题安装包大小（传输用，不进 AI 上下文，防 assets 等物料撑大下载） */
+      assertSize(zipPath, zipSize, OUTPUT_LIMITS.themeZip, '主题安装包');
+      const size = (zipSize / 1024).toFixed(0);
       console.log(`  📦 ${themeId}.zip (${size} KB)`);
```

main() 末尾新增 fail build 判定（+10）：
```diff
   console.log(`\n✅ 已生成 ${themes.length} 个主题包 → ${PACKAGES_DIR}`);
+
+  /* ========== 大小评估汇总：若有任何超限，中断构建 ==========
+   * 违规已在编译过程中实时打印，这里做最终判定并给出修复指引。
+   * 这是防止主题无限膨胀的硬门禁：超限即 fail build，阻止入库。
+   */
+  if (sizeViolations.length > 0) {
+    console.error(`\n🚫 大小评估未通过：${sizeViolations.length} 项超限`);
+    console.error('   源文件超限 → 精简 tokens/模板/规范，或拆分多文件');
+    console.error('   编译产物超限 → 检查 antd 是否全量内联、图片是否未压缩');
+    console.error('   阈值可在 theme.config.json 的 sizeLimits 中调整');
+    process.exit(1);
+  }
+  console.log(`\n✅ 大小评估通过：源文件 + 编译产物均在阈值内`);
 }
```

## 追加：配置可读性与 README 补全（会话-5）

### 背景
- `theme.config.json` 的阈值是裸数字，不熟悉的人看不出各参数含义。
- README 缺少 `sizeLimits` 的说明（会话-4 漏更）。

### 方案
- JSON 不支持注释，改用 `description`/`unit` 元数据字段承载说明，配置自解释。
- 阈值从裸数字升级为对象写法 `{limit, unit, description}`，并保留 `_doc` 段落说明字段。
- 构建脚本新增 `resolveLimit`/`resolveLimitGroup`，兼容对象写法与旧的数字写法（向后兼容）。
- README 新增「大小限制配置」章节，逐字段解释含义/单位/依据/超限后果，并更新构建流程第 8 步与贡献指引。

### 代码变更

#### theme.config.json（结构升级）
阈值由裸数字改为对象写法（含 description/unit），新增 `_doc` 说明字段。以 themeJson 为例：
```diff
-      "themeJson": 8192,
+      "themeJson": {
+        "limit": 8192,
+        "unit": "bytes (8KB)",
+        "description": "单个 theme.json 上限。含主题元数据 + 设计 tokens，膨胀意味着 tokens 失控"
+      },
```
其余 7 个阈值（patternTsx/standardMd/themeContextTotal/summaryJson/patternPreviewHtml/previewImage/themeZip）同样升级为对象写法，并在 source/output 组各加一个 `_doc` 字段。

#### scripts/build-index.js（+27 解析逻辑）
```diff
 const SIZE_LIMITS = config.sizeLimits || {};
-const SOURCE_LIMITS = SIZE_LIMITS.source || {};
-const OUTPUT_LIMITS = SIZE_LIMITS.output || {};
+
+/**
+ * 解析单个阈值：兼容两种配置写法
+ * - 数字写法（向后兼容）：8192
+ * - 对象写法（带注释，推荐）：{ limit: 8192, unit: "8KB", description: "..." }
+ * 其中的 unit/description 仅供人类阅读，构建只取 limit 数字
+ */
+function resolveLimit(entry) {
+  if (entry == null) return undefined;
+  if (typeof entry === 'number') return entry;
+  if (typeof entry === 'object' && typeof entry.limit === 'number') return entry.limit;
+  return undefined;
+}
+
+/**
+ * 把一组阈值配置预处理成 { 字段: 数字 } 形式，下游 assertSize 直接用
+ * 跳过 _doc 等纯说明字段（非数字、非对象）
+ */
+function resolveLimitGroup(group) {
+  const out = {};
+  for (const [key, val] of Object.entries(group || {})) {
+    if (key.startsWith('_')) continue; /* _doc 等注释字段跳过 */
+    const n = resolveLimit(val);
+    if (n != null) out[key] = n;
+  }
+  return out;
+}
+
+const SOURCE_LIMITS = resolveLimitGroup(SIZE_LIMITS.source);
+const OUTPUT_LIMITS = resolveLimitGroup(SIZE_LIMITS.output);
```
下游所有 `assertSize(..., SOURCE_LIMITS.xxx, ...)` 调用无需改动（取值仍是数字）。

#### README.md
- 新增「大小限制配置」章节：评估依据、source/output 两组字段表、对象/数字两种写法示例、`_doc` 字段说明、超限行为。
- 场景配置示例补全 `presentation: 演讲`。
- 构建流程新增第 8 步（大小评估汇总）。
- 「贡献新主题」第 5 步补充大小评估提示。

## 追加：自审与缺陷修复（会话-6）

### 背景
会话-4/5 落地大小评估后，做一次完整自审，排查实现是否合理、有无遗漏和副作用。

### 排查结论
**合理的部分**：
- 三层评估对象划分（source/output/summary）与 SKILL.md 消费链路一致
- summary.json 字段干净，未泄漏 source/standards/contextBytes
- fail build 机制可靠，三场景（通过/超限/恢复）实测正确
- 配置对象/数字双写法兼容，_doc 自动跳过
- zip 包含 standards，AI 安装后可读

**发现并修复的缺陷**：
1. **assets 目录无大小评估**（中）：SKILL.md Phase 5 会引用 assets 物料，但此前完全没卡大小，单个未压缩插画可撑大 zip 与仓库。→ 新增 `output.assetFile`（512KB）阈值，递归扫描 assets/ 所有文件逐个断言。
2. **standards 嵌入 detail.json 但前端不展示**（中）：会话-4 新增 standards 字段进了 detail.json（每文件多几 KB），但 detail.js 未渲染，用户在详情页看不到。→ detail.js 新增 `renderStandardsSection`，复用 pattern-item 折叠交互展示 Markdown 原文。
3. **临时目录未进 .gitignore**（小）：.tmp-build/.tmp-package 在构建崩溃时可能残留进 git。→ 加入 .gitignore。

### 代码变更

#### .gitignore +2
```diff
 .history
 node_modules
+.tmp-build
+.tmp-package
```

#### theme.config.json（output 组新增 assetFile）
```diff
       "themeZip": {
         "limit": 204800,
         "unit": "bytes (200KB)",
         "description": "单个主题 zip 安装包上限。预留 assets 物料空间"
-      }
+      },
+      "assetFile": {
+        "limit": 524288,
+        "unit": "bytes (512KB)",
+        "description": "单个 assets 物料文件上限（icons/illustrations/fragments）。防未压缩插画/大图撑大 zip 与仓库"
+      }
```

#### scripts/build-index.js（+15 assets 扫描）
插入在 standards 扫描之后、contextBytes 计算之前：
```diff
+    /* 扫描 assets/ 物料目录（icons/illustrations/fragments），评估每个文件大小
+     * assets 不进 AI 上下文，但会打进 zip 并部署到仓库，单文件过大易撑大下载与仓库 */
+    const assetsDir = path.join(THEMES_DIR, entry.name, 'assets');
+    if (fs.existsSync(assetsDir)) {
+      const scanAssets = (dir) => {
+        for (const file of fs.readdirSync(dir, { withFileTypes: true }).sort()) {
+          const fullPath = path.join(dir, file.name);
+          if (file.isDirectory()) {
+            scanAssets(fullPath); /* 递归子目录：icons/illustrations/fragments */
+          } else {
+            assertSize(fullPath, fs.statSync(fullPath).size, OUTPUT_LIMITS.assetFile, '物料文件');
+          }
+        }
+      };
+      scanAssets(assetsDir);
+    }
+
     /* 评估单主题上下文总和：theme.json + 所有 patterns/*.tsx + 所有 standards/*.md
```

#### docs/detail.js（+37 standards 展示）
新增 `renderStandardsSection` 函数（复用 pattern-item 折叠交互，仅展示源码，无预览切换）：
```diff
+  /* 渲染设计规范（standards）区块：每个规范文件可展开查看 Markdown 原文
+   * 复用 pattern-item 的折叠交互（bindPatternModeSwitch 绑定 .pattern-item-header），
+   * 但不需要预览/源码切换，仅展示源码 */
+  function renderStandardsSection(standards) {
+    if (!standards || standards.length === 0) return '';
+    const list = standards.map((item, idx) => `
+      <div class="pattern-item" data-group="standards" data-index="${idx}" data-mode="source">
+        <div class="pattern-item-header">
+          <span class="pattern-item-name">${escapeHTML(formatPatternName(item.name))}</span>
+          <span class="pattern-item-file">${escapeHTML(item.file)}</span>
+          <span class="pattern-item-toggle">展开</span>
+        </div>
+        <div class="pattern-item-content" style="display:none;">
+          <div class="pattern-source-container">
+            <pre><code>${escapeHTML(item.source)}</code></pre>
+          </div>
+        </div>
+      </div>
+    `).join('');
+    return `
+      <div class="token-section">
+        <div class="token-section-title">设计规范 (Standards)<span class="toggle-icon">▼</span></div>
+        <div class="token-section-body">
+          <div class="pattern-group">
+            <h3 class="pattern-group-title">规范文档 (${standards.length})</h3>
+            <div class="pattern-list">${list}</div>
+          </div>
+        </div>
+      </div>`;
+  }
+
   /* 渲染一组 patterns */
   function renderPatternGroup(label, groupKey, items) {
```
在 renderDetail 模板中插入 standardsSection：
```diff
     /* patterns 区块 */
     const patternsSection = theme.patterns ? renderPatternsSection(theme.patterns) : '';
+    /* standards 区块（设计规范 Markdown，可展开查看原文） */
+    const standardsSection = theme.standards ? renderStandardsSection(theme.standards) : '';
     ...
       ${tokenSections.join('')}
       ${patternsSection}
+      ${standardsSection}
     `;
```

## 追加：source 组改用 token 量化（会话-9）

### 背景
- 会话-8 审视发现：source 组阈值量化的是"文件字节数"，不是"上下文消耗（token 数）"，字节数只是代理指标。
- 名实不符：章节叫"上下文占用"、字段叫 `themeContextTotal`，但数字是字节，易被误读为 token 数。
- 同样字节数，重复内容与多样化内容的 token 数相差 10 倍以上，字节做代理会失真。

### 方案（用户确认）
- **source 组改用 token 量化**（进 AI 上下文的文件，token 才是真实消耗）
- **output 组保持字节量化**（图片/HTML/zip 是传输存储成本，token 对图片无意义）
- 分词器用 `gpt-tokenizer` 的 `cl100k_base`（GPT-4 同代，与 Claude 接近）。Claude 实际分词器未开源，近似值，数量级准确。
- 工作量评估：核心 3 处改动 + 文档测试，1 会话内落地。性能影响 +25ms（全量 22 源文件编码），可忽略。

### 阈值校准（字节→token，按现状最大值留 1.7×~2.6× 余量）
| 字段 | 原字节阈值 | 现状最大 token | 新 token 阈值 | 余量 |
|------|-----------|---------------|--------------|------|
| themeJson | 8KB | 1275 | 2500 | 2.0× |
| patternTsx | 12KB | 2302 | 4000 | 1.7× |
| standardMd | 8KB | 1217 | 2500 | 2.1× |
| themeContextTotal | 80KB | 5847 | 15000 | 2.6× |
| summaryJson | 64KB | 1189 | 16000 | 约 65 主题空间（240 token/主题） |

### 代码变更

#### package.json（+1 依赖）
```diff
   "devDependencies": {
     "@types/react": "^18.3.3",
     "@types/react-dom": "^18.3.0",
+    "gpt-tokenizer": "^3.4.0",
     "esbuild": "^0.20.0",
     "react": "^18.3.1",
     "react-dom": "^18.3.1"
   },
```

#### scripts/build-index.js
引入 token 计数（+11）：
```diff
 const esbuild = require('esbuild');
+/* gpt-tokenizer 使用 cl100k_base 分词器（GPT-4 同代，与 Claude 接近），用于估算源文件的 token 数
+ * 仅用于 source 组（进 AI 上下文的文件）的上下文消耗量化；output 组仍用字节数 */
+const { encode } = require('gpt-tokenizer');
+
+/**
+ * 估算文本的 token 数（cl100k_base 近似）
+ * 注意：Claude 的实际分词器未开源，此为近似值，数量级准确，用于防膨胀门禁足够
+ * @param {string} text
+ * @returns {number}
+ */
+function countTokens(text) {
+  return encode(text).length;
+}
```

评估段落重构：`resolveLimit` 解析 `{limit, isTokens}`，新增 `assertBudget`（token/字节双模式）与 `assertBytes`（专用于二进制产物），删除原 `assertSize`：
```diff
-function resolveLimit(entry) {
-  if (entry == null) return undefined;
-  if (typeof entry === 'number') return entry;
-  if (typeof entry === 'object' && typeof entry.limit === 'number') return entry.limit;
-  return undefined;
-}
+function resolveLimit(entry) {
+  if (entry == null) return undefined;
+  if (typeof entry === 'number') return { limit: entry, isTokens: false };
+  if (typeof entry === 'object' && typeof entry.limit === 'number') {
+    const unitStr = typeof entry.unit === 'string' ? entry.unit.toLowerCase() : '';
+    return { limit: entry.limit, isTokens: unitStr.includes('token') };
+  }
+  return undefined;
+}
```
```diff
-function assertSize(filePath, size, limit, label) {
-  if (limit == null || typeof limit !== 'number') return;
-  if (size <= limit) return;
-  ...
-}
+function assertBudget(filePath, content, limit, label) {
+  if (limit == null || typeof limit.limit !== 'number') return;
+  const usage = limit.isTokens ? countTokens(content) : Buffer.byteLength(content);
+  if (usage <= limit.limit) return;
+  const usageStr = limit.isTokens ? `${usage} tokens` : `${(usage/1024).toFixed(1)}KB`;
+  const limitStr = limit.isTokens ? `${limit.limit} tokens` : `${(limit.limit/1024).toFixed(1)}KB`;
+  sizeViolations.push({ filePath, label, usage, limit: limit.limit, isTokens: limit.isTokens, message: ... });
+  console.error(`   ✗ ${label}超限: ${usageStr} > ${limitStr}  ${filePath}`);
+}
+
+function assertBytes(filePath, size, limit, label) {
+  if (limit == null || typeof limit.limit !== 'number') return;
+  if (limit.isTokens) return; /* output 组不应配 token 维度，防御性跳过 */
+  ...
+}
```

调用点切换（source → assertBudget 传文本，output → assertBytes 传字节数），以 themeJson 和 patternPreviewHtml 为例：
```diff
-    assertSize(themeJsonPath, Buffer.byteLength(themeJsonRaw), SOURCE_LIMITS.themeJson, '主题 JSON');
+    assertBudget(themeJsonPath, themeJsonRaw, SOURCE_LIMITS.themeJson, '主题 JSON');
```
```diff
-          assertSize(outputPath, Buffer.byteLength(html), OUTPUT_LIMITS.patternPreviewHtml, 'Pattern 预览 HTML');
+          assertBytes(outputPath, Buffer.byteLength(html), OUTPUT_LIMITS.patternPreviewHtml, 'Pattern 预览 HTML');
```

单主题上下文总和改用 token 计数，字段 `contextBytes` → `contextTokens`：
```diff
-    const contextBytes =
-      Buffer.byteLength(themeJsonRaw) +
-      [...patterns.pages, ...patterns.components].reduce(
-        (sum, p) => sum + Buffer.byteLength(p.source), 0) +
-      standards.reduce((sum, s) => sum + Buffer.byteLength(s.source), 0);
-    assertSize(path.join(THEMES_DIR, entry.name), contextBytes, SOURCE_LIMITS.themeContextTotal, '单主题上下文总和');
+    const contextContent =
+      themeJsonRaw +
+      [...patterns.pages, ...patterns.components].map((p) => p.source).join('') +
+      standards.map((s) => s.source).join('');
+    const contextTokens = countTokens(contextContent);
+    assertBudget(path.join(THEMES_DIR, entry.name), contextContent, SOURCE_LIMITS.themeContextTotal, '单主题上下文总和');
```
```diff
     themes.push({
       ...
-      contextBytes,
+      contextTokens,
     });
```

#### theme.config.json（source 组阈值改 token，output 组不变）
```diff
       "themeJson": {
-        "limit": 8192,
-        "unit": "bytes (8KB)",
-        "description": "单个 theme.json 上限。含主题元数据 + 设计 tokens，膨胀意味着 tokens 失控"
+        "limit": 2500,
+        "unit": "tokens",
+        "description": "单个 theme.json 的 token 上限。含主题元数据 + 设计 tokens，膨胀意味着 tokens 失控"
       },
```
（patternTsx 12288→4000、standardMd 8192→2500、themeContextTotal 81920→15000、summaryJson 65536→16000 同样改 limit+unit；output 组保持不变）

#### README.md / AGENTS.md
重写「大小限制配置」章节：新增"量化维度"对照表（source 用 token / output 用字节的理由）、source 表加"现状最大"列、配置写法示例改 token、超限行为说明 source 显示 tokens/output 显示 KB、token 近似性声明。

## 追加：去除 Claude 绑定表述，强调通用性（会话-10）

### 背景
- 用户指出：README 写"这些文件会被 Claude 读取"，但主题系统面向通用 agent 和模型，不应绑定 Claude。
- 技术事实：方案本就通用——机制层是纯 Node.js，token 计数用通用 BPE 分词器，消费链路是通用资产分发。问题只在表述，不在架构。

### 修正
将所有"Claude 绑定"措辞改为通用表述：
- README：「会被 Claude 读取」→「会被 AI agent 读取」；token 计数说明改为"面向通用 AI agent 与模型，不绑定特定模型"
- AGENTS.md：「与 Claude 接近」→「本系统面向通用 AI agent，不绑定特定模型」
- theme.config.json _doc：「与 Claude 接近」→「面向通用模型」
- build-index.js 注释：同步去除"与 Claude 接近"，改为"面向通用 AI agent，不绑定特定模型"

### 代码变更（仅注释/文档，无逻辑改动）

#### README.md
```diff
-| **source**（进 AI 上下文） | **token 数** | 这些文件会被 Claude 读取，token 才是真实的上下文消耗。... |
+| **source**（进 AI 上下文） | **token 数** | 这些文件会被 AI agent 读取，token 才是真实的上下文消耗。... |
```
```diff
-> **token 计数说明**：使用 `gpt-tokenizer` 的 `cl100k_base` 分词器（GPT-4 同代，与 Claude 接近）。Claude 的实际分词器未开源，故为**近似值**，数量级准确，用于防膨胀门禁足够。
+> **token 计数说明**：使用 `gpt-tokenizer` 的 `cl100k_base` 分词器估算 token 数。本系统面向通用 AI agent 与模型，不绑定特定模型；cl100k_base 是主流 BPE 分词器之一，对各模型的 token 数都能给出合理的数量级估算（不同模型实际分词器略有差异，故为**近似值**，用于防膨胀门禁足够）。
```

#### scripts/build-index.js（注释）
```diff
-/* gpt-tokenizer 使用 cl100k_base 分词器（GPT-4 同代，与 Claude 接近），用于估算源文件的 token 数
- * 仅用于 source 组（进 AI 上下文的文件）的上下文消耗量化；output 组仍用字节数 */
+/* gpt-tokenizer 使用 cl100k_base 分词器估算 token 数。本系统面向通用 AI agent，不绑定特定模型；
+ * cl100k_base 是主流 BPE 分词器之一，各模型 token 数量级估算接近。仅用于 source 组（进 AI 上下文的
+ * 文件）的上下文消耗量化；output 组仍用字节数 */
```
```diff
- * 注意：Claude 的实际分词器未开源，此为近似值，数量级准确，用于防膨胀门禁足够
+ * 注意：不同模型实际分词器略有差异，此为近似值，数量级准确，用于防膨胀门禁足够
```

#### theme.config.json（_doc）
```diff
-      "_doc": "源文件阈值：这些文件会进入 ui-design-skill 的 AI 上下文，按 token 量化（cl100k_base 近似，与 Claude 接近）。需卡紧",
+      "_doc": "源文件阈值：这些文件会进入 AI agent 的上下文，按 token 量化（cl100k_base 近似，面向通用模型）。需卡紧",
```

#### AGENTS.md
```diff
-- **source 组用 token 数**：进 AI 上下文的文件，token 才是真实上下文消耗。用 `gpt-tokenizer`（cl100k_base 近似，与 Claude 接近）计数。Claude 实际分词器未开源，故为近似值，数量级准确。
+- **source 组用 token 数**：进 AI 上下文的文件，token 才是真实上下文消耗。用 `gpt-tokenizer`（cl100k_base）计数。本系统面向通用 AI agent，不绑定特定模型；不同模型分词器略有差异，故为近似值，数量级准确。
```

## 追加：取舍方法论沉淀为独立文档（会话-13）

### 背景
- 会话-9~12 围绕"token vs 字节""cl100k 对 DeepSeek/GLM 偏差"做了多轮讨论，结论散落在对话里。
- 用户要求把这套取舍方法论记录下来，并通过链接引用到 README，方便未来查阅和质疑时溯源。

### 产出
新增 `docs-design/size-limits-rationale.md`（仓库根的 docs-design/ 目录，区别于构建产物 docs/），内容涵盖：
1. 核心问题：上下文膨胀 vs 存储膨胀必须分开处理
2. 三个关键决策：source 用 token / output 用字节；cl100k 近似不追求精确；阈值留 1.7×~2.6× 余量
3. 三个被否决方案：全部用字节（失真）、多分词器取 max（太重）、绑定某模型精确计数（违背通用性）
4. 已知局限与可接受性：cl100k 偏差、临界灰区、极端密度内容
5. 通用性声明：不绑定任何特定 AI 模型
6. 决策回顾点：未来何时该重新审视方案

README 两处链接引用：
- 「大小限制配置」章节开头加 📖 设计取舍引导
- token 计数说明处补 DeepSeek/GLM 偏差说明 + 方法论链接

### 代码变更（纯文档，无逻辑改动）

#### docs-design/size-limits-rationale.md（新增，约 110 行）
完整方法论文档，结构见上方"产出"。关键内容片段：
```markdown
## 否决 A：全部用文件大小（字节）
- 误伤：重复内容对 AI 只有 2501 token，字节阈值会误拦
- 漏放：高密度内容字节不多但 token 高
- 核心比喻：字节是"精确的体重秤"，token 是"略有误差的体温计"。
  防"发烧"该用体温计——字节"确定地衡量了错误的东西"。
```

#### README.md（+2 处链接引用）
```diff
 ## 大小限制配置

 为防止主题无限膨胀，构建时会对**上下文消耗**和**文件大小**做硬门禁...
+
+> 📖 **设计取舍**：为什么 source 组用 token、output 组用字节？为什么用 cl100k 近似而非精确计数？
+> 为什么不用文件大小做代理？完整决策依据见 [大小限制方案取舍方法论](docs-design/size-limits-rationale.md)。
```
```diff
-> **token 计数说明**：...（不同模型实际分词器略有差异，故为**近似值**，用于防膨胀门禁足够）。
+> **token 计数说明**：...（不同模型实际分词器略有差异，故为**近似值**，用于防膨胀门禁足够）。
+> 对 DeepSeek/GLM 等中文优化分词器，实际 token 数可能比估算值高 10-25%，阈值已留 1.7×~2.6× 余量覆盖。
+> 详细取舍见 [方法论](docs-design/size-limits-rationale.md)。
```

#### .agentdocs/index.md（新增"设计决策文档"分区）
```diff
 # AgentDocs 索引

+## 设计决策文档（长期参考）
+`../docs-design/size-limits-rationale.md` - 大小限制方案取舍方法论：为什么 source 用 token / output 用字节、为什么 cl100k 近似、为什么不回退字节。README「大小限制配置」章节引用。
+
 ## 当前变更文档
```

## 追加：方法论文档改名（会话-14）

### 背景
- "大小限制方案取舍方法论"名称太笼统，"大小"无法体现 source 组（上下文）与 output 组（体积）的双维度设计。
- 用户要求改名为"上下文&体积限制方案分析"，更准确对应方案本质。

### 改动
- 文件名：`docs-design/size-limits-rationale.md` → `docs-design/context-volume-limits-analysis.md`（用 git mv 保留历史）
- 文档标题：`# 大小限制方案取舍方法论` → `# 上下文&体积限制方案分析`
- 同步更新所有引用：README 两处链接（显示文本 + 路径）、.agentdocs/index.md 登记
- 会话-13 的历史 diff 记录中旧文件名引用保持原样（留痕忠实于当时事实）

### 代码变更（纯文档改名，无逻辑改动）

#### docs-design/（文件重命名）
```diff
-size-limits-rationale.md  →  context-volume-limits-analysis.md
```
标题：
```diff
-# 大小限制方案取舍方法论
+# 上下文&体积限制方案分析
```

#### README.md（2 处链接更新）
```diff
-> 完整决策依据见 [大小限制方案取舍方法论](docs-design/size-limits-rationale.md)。
+> 完整决策依据见 [上下文&体积限制方案分析](docs-design/context-volume-limits-analysis.md)。
```
```diff
-> 详细取舍见 [方法论](docs-design/size-limits-rationale.md)。
+> 详细取舍见 [方法论](docs-design/context-volume-limits-analysis.md)。
```

#### .agentdocs/index.md（登记更新）
```diff
-`../docs-design/size-limits-rationale.md` - 大小限制方案取舍方法论：...
+`../docs-design/context-volume-limits-analysis.md` - 上下文&体积限制方案分析：...
```

## 追加：单主题下载包总量阈值调整（会话-16/17）

### 背景
- 用户问"有没有对单主题总大小做限制"。排查发现：
  - ✅ 源文件 token 总量有 `themeContextTotal`（15000 tokens）
  - ❌ 单主题物理目录总大小无直接限制
  - ✅ zip 下载包有 `themeZip`，但 200KB 阈值与 `assetFile` 512KB 存在数值矛盾（一个 asset 就能撑爆 zip 预算）
- 用户确认：补"单主题 zip 下载包总量"限制，方向是调大现有 `themeZip` 阈值使其与 assetFile 协调。

### 改动
将 `themeZip` 阈值从 200KB 调到 2MB，与 `assetFile` 512KB 协调：
- 单 asset 上限 512KB（防单个大图失控）
- zip 总量上限 2MB（防 asset 数量累积失控，可容下约 4 个接近上限的 asset 或很多小 asset）
- 字段语义不变（单主题下载包总量），只调阈值数值，最小改动

### 关键事实记录
- **zip 包含**：theme.json + patterns/ + standards/ + assets/（打包时排除 previews）
- **zip 阈值卡的是压缩后下载体积**（非原始体积）——对"下载成本"是正确度量。实测：5 个 460KB 随机数据 asset（不可压缩）→ zip 2256KB 触发；全零字节 asset（可压缩到几 KB）→ 不触发，符合预期
- **未覆盖 previews**：预览图膨胀只由单文件 `previewImage` 4MB 卡，无"单主题预览图总量"约束（有意设计，previews 不进下载包/不进上下文）

### 代码变更

#### theme.config.json
```diff
       "themeZip": {
-        "limit": 204800,
-        "unit": "bytes (200KB)",
-        "description": "单个主题 zip 安装包上限。预留 assets 物料空间"
+        "limit": 2097152,
+        "unit": "bytes (2MB)",
+        "description": "单个主题 zip 安装包上限（含 theme.json + patterns + standards + assets，不含 previews）。卡单主题下载包总量，与 assetFile 512KB 协调：单文件防失控，总量防数量累积"
       },
```

#### README.md
```diff
-| `themeZip` | 200KB | 单个主题 zip 安装包上限。预留 assets 物料空间 |
+| `themeZip` | 2MB | 单个主题 zip 安装包上限（含 theme.json + patterns + standards + assets，不含 previews）。卡单主题下载包总量，与 assetFile 512KB 协调：单文件防失控，总量防数量累积 |
```

#### AGENTS.md
```diff
-| zip 包 | 200K | bytes | `output.themeZip` |
+| zip 包 | 2M | bytes | `output.themeZip` | 卡单主题下载包总量（含 assets，不含 previews），与 assetFile 512KB 协调 |
```

#### docs-design/context-volume-limits-analysis.md（新增局限 4）
```diff
+### 局限 4：单主题物理总量的覆盖范围
+
+"单主题总大小"由两层限制覆盖，但都不完整：
+- 源文件 token 总量（themeContextTotal 15000 tokens）：卡 theme.json + tsx + md 的上下文成本。
+- zip 下载包总量（themeZip 2MB）：卡 theme.json + patterns + standards + assets 的压缩后下载体积，与 assetFile 512KB 协调。
+- 未覆盖：previews 目录。zip 打包时排除 previews，预览图膨胀只由单文件 previewImage 4MB 卡，无"单主题预览图总量"约束。有意设计——previews 不进下载包/不进上下文，只影响仓库体量。
```

## 测试用例
### TC-001 现状主题构建通过
- 类型：回归测试
- 优先级：高
- 关联模块：build-index.js 大小评估
- 前置条件：themes/ 下 5 个主题均为现状体积
- 操作步骤：
  1. 执行 `npm run build`
- 预期结果：
  - 构建成功，退出码 0
  - 末尾打印 `✅ 大小评估通过：源文件 + 编译产物均在阈值内`
  - 无 `✗ ...超限` 输出
- 是否通过：✅ 通过（实测末尾输出"大小评估通过"，退出码 0）

### TC-002 单文件超限触发 fail build
- 类型：功能测试
- 优先级：高
- 关联模块：assertSize / sizeViolations
- 前置条件：现状主题构建通过
- 操作步骤：
  1. 在 `themes/apple-theme/patterns/components/` 新建 `_size-test.tsx`，体积撑至 13155 字节（超 12288 阈值）
  2. 执行 `npm run build`
- 预期结果：
  - 打印 `✗ Pattern 模板超限: 12.8KB > 12.0KB  .../_size-test.tsx`
  - 打印 `🚫 大小评估未通过：1 项超限`
  - 退出码 1
- 是否通过：✅ 通过（实测退出码 1，明细正确打印；测试后已删除 _size-test.tsx）

### TC-003 清理后恢复正常
- 类型：回归测试
- 优先级：中
- 关联模块：build-index.js
- 前置条件：TC-002 已执行
- 操作步骤：
  1. 删除 `_size-test.tsx`
  2. 执行 `npm run build`
- 预期结果：构建成功，退出码 0，打印"大小评估通过"
- 是否通过：✅ 通过（实测退出码 0）

### TC-004 配置对象写法 + 数字写法兼容
- 类型：功能测试
- 优先级：高
- 关联模块：resolveLimit / resolveLimitGroup
- 前置条件：theme.config.json 已升级为对象写法（含 _doc/description/unit）
- 操作步骤：
  1. 现状构建 → 应通过（对象写法被正确解析为数字）
  2. 造 13K 超限 tsx → 应 fail build（退出码 1）
  3. 清理后构建 → 应恢复通过
- 预期结果：三种场景退出码分别为 0/1/0，门禁生效
- 是否通过：✅ 通过（实测三场景退出码 0/1/0）

### TC-005 assets 物料超限触发 fail build
- 类型：功能测试
- 优先级：高
- 关联模块：assertSize（assetFile 阈值）
- 前置条件：theme.config.json 已配置 output.assetFile = 524288 (512KB)
- 操作步骤：
  1. 在 `themes/apple-theme/assets/icons/` 新建 `_big.png`，体积 600000 字节（超 512KB 阈值）
  2. 执行 `npm run build`
- 预期结果：
  - 打印 `✗ 物料文件超限: 585.9KB > 512.0KB .../_big.png`
  - 打印 `🚫 大小评估未通过：1 项超限`
  - 退出码 1
- 是否通过：✅ 通过（实测打印明细，退出码 1；测试后已删除 _big.png）

### TC-006 standards 在详情页可展示
- 类型：功能测试
- 优先级：中
- 关联模块：detail.js renderStandardsSection
- 前置条件：主题含 standards/*.md，构建已生成 detail.json
- 操作步骤：
  1. `npm run build`
  2. 打开 `docs/detail.html?theme=apple-theme`
  3. 检查页面是否出现"设计规范 (Standards)"区块，点击"展开"可查看 Markdown 原文
- 预期结果：standards 区块出现，折叠/展开交互正常
- 是否通过：✅ 通过（renderStandardsSection 已注入模板，复用 pattern-item 折叠事件）

### TC-007 source 组 token 量化 fail build
- 类型：功能测试
- 优先级：高
- 关联模块：assertBudget / countTokens
- 前置条件：theme.config.json source 组阈值已改为 token（patternTsx=4000 tokens）
- 操作步骤：
  1. 造一个多样化英文内容的 tsx（避免重复词被分词器压缩），token 数约 41000（超 4000 阈值）
  2. 执行 `npm run build`
- 预期结果：
  - 打印 `✗ Pattern 模板超限: 41387 tokens > 4000 tokens`（按 token 单位，非 KB）
  - 同时触发 `✗ 单主题上下文总和超限: 46098 tokens > 15000 tokens`
  - 退出码 1
- 是否通过：✅ 通过（实测两项超限均按 token 显示，退出码 1）

### TC-008 token vs 字节的量化差异验证
- 类型：功能测试
- 优先级：中
- 关联模块：countTokens
- 操作步骤：
  1. 造文件 A：`apple ` 重复 2500 次（15060 字节，2517 token）→ 不超 4000 token 阈值
  2. 造文件 B：多样化英文 187069 字节，41387 token → 超 4000 token 阈值
- 预期结果：文件 A 通过、文件 B fail，证明 token 量化比字节更准确反映上下文消耗
- 是否通过：✅ 通过（A 未触发、B 触发，同字节量级 token 差 16 倍）

### TC-009 字段重命名 contextBytes→contextTokens
- 类型：回归测试
- 优先级：中
- 关联模块：detail.json / detail.js
- 操作步骤：
  1. `npm run build`
  2. 检查 `docs/themes/*.json` 顶层字段
- 预期结果：含 `contextTokens`，不含 `contextBytes`；前端 detail.js 未引用该字段，无影响
- 是否通过：✅ 通过（实测顶层字段含 contextTokens=4711，前端无引用）

### TC-010 单主题 zip 总量超限触发 fail build
- 类型：功能测试
- 优先级：高
- 关联模块：assertBytes（themeZip 阈值）
- 前置条件：themeZip 阈值已调为 2MB，assetFile 为 512KB
- 操作步骤：
  1. 在 `themes/apple-theme/assets/icons/` 造 5 个 460KB 的随机数据文件（每个 < 512KB 单文件阈值，合计 > 2MB）
  2. 执行 `npm run build`
- 预期结果：
  - 单文件 asset 不触发（460KB < 512KB）
  - zip 总量触发：`✗ 主题安装包超限: 2256.7KB > 2048.0KB`
  - 退出码 1
- 是否通过：✅ 通过（实测随机数据触发，退出码 1；全零字节因压缩不触发，符合"卡压缩后下载体积"设计）

### TC-011 themeZip 与 assetFile 协调性
- 类型：功能测试
- 优先级：中
- 关联模块：assertBytes
- 操作步骤：
  1. 造 1 个 460KB asset（单文件不超 512KB，zip 总量不超 2MB）→ 应通过
  2. 造 1 个 600KB asset（单文件超 512KB）→ assetFile 触发
- 预期结果：单文件与总量两层独立生效，互不干扰
- 是否通过：✅ 通过（设计验证，两层阈值各自拦截对应失控场景）
