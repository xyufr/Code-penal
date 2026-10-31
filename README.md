# Code pénal · 法国刑法典 · French Penal Code

已收录 **1,301 条现行法条**，涵盖立法部分与法规部分，按 15 卷、103 个章节分组组织。语料版本日期 **2026-10-20**；已与 Légifrance 于 **2026-10-29** 生成的官方整本 PDF 全量核对。全部条文编号及法文正文一致（忽略排版差异），不含已废止历史版本。官方资料标注最近更新于 **2026-08-26**。

**中英文本为未经法律专业审校的参考译文。** 中文译文已全部由 AI（Claude）直接从法语重译，不经英语中转；英语仍为本地 Argos 机器初稿，含个别 AI 修订，未重译。自动数字检查发现疑点的条文会额外提示核对金额、期限及法条引用；该检查不能证明翻译正确。

**Français.** Corpus intégral de 1 301 articles, parties législative et réglementaire, version du 20 octobre 2026. Les identifiants et textes français ont été comparés au PDF officiel de Légifrance généré le 29 octobre 2026. Les traductions anglaise et chinoise sont des brouillons non officiels et non révisés juridiquement ; le chinois est traduit directement du français. Les versions abrogées ne sont pas incluses.

**English.** Complete corpus of 1,301 articles, legislative and regulatory parts, as of 20 October 2026. Identifiers and French texts were compared with the official Légifrance PDF generated on 29 October 2026. English and Chinese are unofficial drafts without legal review; Chinese is translated directly from French, with no English pivot. Repealed historical versions are excluded.

## 使用 / Usage

Node.js 22+。浏览器端使用 HTML/CSS/ES modules，不依赖外部字体或在线翻译接口。

```sh
npm ci
npm run dev
```

本地地址：`http://127.0.0.1:5173`。

- 法／中／英界面及正文，单语或三语逐段阅读。
- 三语全文搜索、法文重音兼容、编号优先排序，支持 `R. 131-2`、`第224-1 A条`。
- 立法／法规目录，章节筛选，结果每页 30 条。
- 收藏、独立分享链接、打印、关联阅读。收藏只存于当前浏览器。
- `⌘K` / `Ctrl+K` 聚焦搜索。
- 对未核实单条生效日期的新条文，显示语料版本日期，不冒充生效日期。

## Cloudflare Workers

使用 [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)，无需数据库或服务器 API。目标 Worker 名称在 `wrangler.jsonc` 中。

```sh
npm test
npm run deploy:check
npx wrangler login
npm run deploy
```

线上地址：[https://law.xyufr.com](https://law.xyufr.com)。已于 2026-10-31 部署至 Worker `code-penal-trilingue`，自定义域名在 `wrangler.jsonc` 的 `routes` 中配置。后续运行 `npm run deploy` 即可更新同一网站。Git 自动构建命令 `npm run build`，部署命令 `npx wrangler deploy`。仅 `dist/` 被公开；原始资料、模型和处理脚本不上传为静态资源。

## 数据与校验

- `public/data/articles.json`：唯一运行时语料源，schemaVersion 2。
- `public/data/coverage.json`：覆盖比对报告、翻译方法及数字复核清单。
- `data/source/droit-code-penal.html`：保留的 LEGI 数据镜像原件。
- `data/source/official-pdf-text.txt`：官方 PDF 的完整文本提取，用于独立比对。
- `scripts/seed.mjs`：初版 20 条语料及测试样本，不覆盖完整语料。
- `data/source/initial-selection.json`：重建时保留既有译文的稳定输入。
- `data/source/translation-overrides.json`：已发现遗漏及重复表达的中英修正，仍未经法律专业审校。
- `data/staging/`、`.translation-models/`、`.venv-import/`：本地中间数据、模型及处理环境，已排除版本控制。

语料保留官方来源链接、LEGI 标识符、目录路径、版本日期、翻译状态；三语正文按段落对齐。`effectiveFrom: null` 代表未取得单条生效日期，必须另有 `snapshotDate`。

本次比对发现 droit.org 中 R131-2 对道路法典的引用误为 `R. 1231`，已依据官方 PDF 修正为 `R. 123`，修改记录保留在语料元数据中。

## 法语直接译中文

公开语料中的全部中文（1,301 条正文、标题及目录）已由 Claude 直接从法语重译，不经英语中转；英语译文保持原样。条文标记为 `ai-unreviewed`，`translationProvenance.zh` 记录来源语言、模型和版本。译文遵循固定术语表（crime=重罪、délit=轻罪、contravention=违警罪等）及以下示例：

> 法语：1° 38 euros au plus pour les contraventions de la 1re classe ;
>
> 中文：1° 对于第一级违警罪（contraventions de la 1re classe），罚款最高为38欧元；

流程（Python 3.12+ 标准库，不调用外部 API）：

```sh
# 导出待译分块到 data/staging/claude-zh/in/，目录标签另列 labels-fr.json
python3 scripts/translate-claude-zh.py --export
# 由目录标题词表生成编号一致的标签译文（第一卷、第一编、第一章之一……）
python3 scripts/claude-zh-labels.py
# 导入 out/ 中的译文并校验段落对齐；全部完成后生成 claude-zh-ready.json 和 claude-zh-coverage.json
python3 scripts/translate-claude-zh.py --import
```

译文缓存在 `data/staging/direct-fr-zh-claude.sqlite3`。生成的语料和覆盖报告经人工核对后复制到 `public/data/`。数字检查对中文忽略节、目、违警罪等级等改用中文数字的序号；当前无中文条文被标记，仅英语仍有数字提示。自动检查不能替代法律专业审校。

`scripts/translate-direct-zh.py` 保留 GPT-6 Astra 的备选流程（需 `OPENAI_API_KEY`，会产生费用），并提供两条流程共用的 `finalize` 校验。不要用旧的 `finalize-full-corpus.py` 处理新译文，该脚本仅用于历史导入。

原始快照解析和官方比对脚本仍保留。更新法律版本时，须重新获取官方文本、核对覆盖范围及正文，再重译变化的段落；不要直接改日期冒充更新。当前核对脚本固定此次官方 PDF 的元数据，不是自动同步服务。

## 导入其他三语语料

```sh
npm run import -- /absolute/path/to/corpus.json
```

完整替换语料之前先保留原文件或使用版本控制。脚本校验通过后才原子替换；失败不修改现有语料。兼容 schemaVersion 1 的精选语料。schemaVersion 2 的完整语料还要求覆盖报告与文章总数匹配。

数据由 `books`、`groups`、`articles` 和 `metadata` 构成。标题和正文提供 `fr` / `zh` / `en`；正文是等长段落数组。翻译状态支持 `ai-unreviewed`、`machine-unreviewed`、`human-reviewed`。只有确实完成专业审校后才标为已审校。

## 来源 / Sources

- [Légifrance 官方《Code pénal》](https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070719/)
- [Légifrance 官方整本 PDF](https://www.legifrance.gouv.fr/download/file/pdf/LEGITEXT000006070719.pdf/LEGI)
- [droit.org 结构化 LEGI 镜像](https://codes.droit.org/HTML/Code%20p%C3%A9nal.html)
- [Argos Translate](https://github.com/argosopentech/argos-translate)

## 测试

`npm test` 检查语料完整性、三语对齐、来源和日期、编号变体、组合搜索、分页边界、非法导入及界面翻译键。完整语料还检查覆盖数量、法规条文和翻译占位符。`npm run build` 再次校验语料；`npm run deploy:check` 验证 Workers 打包但不发布。
