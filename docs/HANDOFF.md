# 909「青春赛季」网站交接文档

> 最后核对日期：2026-08-23  
> 当前生产版本：`6209c3c`（`feat: restore structured 909 season narrative`）  
> 生产地址：<https://2022314.xyz>  
> Cloudflare Pages 备用地址：<https://graduation-memorial-2022314.pages.dev>

## 1. 交接摘要

这是深圳市龙华区高峰学校 2025 届 909 班毕业纪念静态网站。当前版本以“青春赛季”为叙事主线，使用 F1 赛季视觉语言组织照片与文字，但不包含赛车品牌、车手素材或第三方站点代码。

网站没有后端、API、数据库、登录系统、内容管理系统、分析脚本或服务端渲染。所有页面、103 条教师名言和 137 张照片都随前端构建一起公开发布。

当前核心能力：

- 一页式滚动叙事首页；
- 3 张可拖拽、点击切换的 Hero 照片；
- “三年三幕”和“课堂内 / 课堂外”内容章节；
- 12 条首页精选名言和 103 条完整名言档案；
- 12 张首页精选照片和 137 张完整图库；
- 图库分类、键盘与触摸灯箱、相邻原图预载；
- 固定站点导航、滚动进度、全屏目录与章节深链；
- 移动端自然滚动、安全区适配、降动效与降透明度适配；
- Cloudflare Pages 静态部署和自定义域名。

## 2. 关键地址与当前状态

| 项目 | 当前值 |
| --- | --- |
| Git 仓库 | `https://github.com/ZONGRUICHD/graduation-memorial-2022314` |
| 默认分支 | `main` |
| 前端目录 | `site/` |
| 生产域名 | `https://2022314.xyz` |
| Pages 项目 | `graduation-memorial-2022314` |
| Cloudflare account ID | `64b2908c3ef53688cc3f5fb0dd5343e8` |
| Pages 备用域名 | `https://graduation-memorial-2022314.pages.dev` |
| 个人博客 | `https://zongtech.xyz/` |
| 当前发布提交 | `6209c3cddab5629fa9ac4c7d76986a0897ada65c` |
| 当前构建资源 | `index-D3vTr5mx.js`、`index-Du8zSn1H.css` |

截至本文档日期，Pages 项目采用手动 Direct Upload，没有连接 Git 自动部署。推送 GitHub 不会自动更新线上站点，发布时必须额外上传 `site/dist/`。

线上应用代码对应 `6209c3c`。后续只修改 README 或仓库文档时不需要重新部署站点；如果 `site/src/`、`site/public/`、`site/index.html`、依赖或构建配置发生变化，就必须重新构建并 Direct Upload。仓库中没有 `.github` 工作流，也没有 Wrangler 配置文件。

生产站点最后一次发布后已经确认：

- 自定义域名返回 HTTP 200；
- 自定义域名返回的 CSS/JS 哈希与本地生产构建一致；
- 全屏目录可打开和关闭；
- 图库包含 137 张照片和全部分类；
- 灯箱可前后切换并关闭；
- 线上页面显示当前完整首页结构。

## 3. 技术栈与运行环境

| 层级 | 技术 | 职责 |
| --- | --- | --- |
| UI | React 19 + TypeScript 6 | 页面、组件、状态和可访问性语义 |
| 构建 | Vite 8 | 开发服务器和生产静态构建 |
| 组件动效 | Motion 13（`motion/react`） | Hero 切换、拖拽、弹簧反馈和滚动映射 |
| 时间线动效 | GSAP 3 + `@gsap/react` | 入场动画、目录打开动画和统一清理 |
| 单元测试 | Vitest + Testing Library | 数据完整性、路由、模态与动效工具 |
| 浏览器测试 | Playwright | 桌面、平板、手机、触摸和降动效路径 |
| 托管 | Cloudflare Pages | 静态文件分发、自定义域名和 CDN |

最后验证环境：

- Node.js `24.19.0`；
- npm `11.17.0`；
- `package-lock.json` 为 lockfile v3；
- Windows 11 + Google Chrome；
- `package-lock.json` 已提交，安装时应优先使用 `npm ci`。

建议在其他环境使用 Node 22 LTS 或更新的受支持版本。Vite 8 不应运行在过旧的 Node 版本上。

## 4. 仓库结构

```text
graduation-memorial-2022314/
├─ README.md                         # 仓库入口说明
├─ docs/
│  ├─ HANDOFF.md                    # 本交接文档
│  └─ superpowers/                  # 早期设计规格与实施计划，仅供历史参考
└─ site/
   ├─ index.html                    # SEO、分享卡片、字体与 Hero 预加载
   ├─ .env.example                  # 已无代码引用的旧 API 示例，非运行依赖
   ├─ package.json                  # 依赖与命令
   ├─ package-lock.json             # 锁定依赖版本
   ├─ vite.config.ts                # Vite / Vitest 配置
   ├─ playwright.config.ts          # 多视口 E2E 配置
   ├─ e2e/memorial.e2e.ts           # 浏览器验收路径
   ├─ scripts/visual-audit.mjs       # 截图、重叠、裁切、溢出检查
   ├─ public/
   │  ├─ favicon.svg
   │  ├─ fonts/                     # Smiley Sans 字体及 OFL 授权
   │  └─ assets/
   │     ├─ gallery/                # 137 张灯箱原图
   │     └─ gallery/thumbs/         # 137 张图库缩略图
   └─ src/
      ├─ main.tsx                   # React 入口
      ├─ App.tsx                    # 顶层路由、标题、弹层状态与滚动定位
      ├─ index.css                  # 全站样式
      ├─ motion.ts                  # GSAP 注册、媒体查询与中文拆字
      ├─ introState.ts              # 入场动画的会话状态
      ├─ galleryImages.ts           # 137 张照片的数据源
      ├─ teacherQuotes.ts           # 103 条名言的数据源
      └─ components/
         ├─ SeasonHome.tsx          # 首页全部叙事章节
         ├─ SiteChrome.tsx          # Logo、图库入口、进度条和全屏目录
         ├─ GalleryArchive.tsx      # 完整图库和分类筛选
         ├─ PhotoLightbox.tsx       # 原图灯箱、键盘和触摸操作
         ├─ QuoteArchive.tsx        # 103 条名言档案弹层
         ├─ IntroSequence.tsx       # 首次进入的 909 入场动画
         └─ useModalDialog.ts       # 焦点锁、滚动锁和焦点返回
```

`docs/superpowers/` 中的文档描述的是较早阶段的设计与计划。发生冲突时，以当前源码、测试和本交接文档为准。

## 5. 页面信息架构

首页内容顺序固定在 `SeasonHome.tsx`：

1. `Hero`：909 巨型数字、三张主图、标题、说明、拖拽和前后切换；
2. `Manifesto`：写给 909 的赛季宣言和 3 年 / 103 条 / 137 张数据；
3. `MemoryRun`：毕业典礼、毕业合影、教室记忆三章；
4. `CampusSplit`：课堂内与课堂外双场景；
5. `QuoteRail`：12 条精选名言及完整档案入口；
6. `MemoryIndex`：12 张精选照片及完整图库入口；
7. `SeasonEnding`：毕业结尾、图库和个人博客入口。

顶部 `SiteChrome` 始终提供：

- 909 首页标识；
- `PHOTO ARCHIVE 137` 快捷入口；
- 滚动进度条；
- 全屏网站目录；
- 键盘跳到主要内容链接。

首页左侧章节轨道由 `IntersectionObserver` 更新当前章节，仅表示阅读进度，不劫持浏览器滚动。

Hero 当前不会自动轮播；用户通过前后按钮、索引点或横向拖拽切换。这是为了避免阅读过程中画面自行变化。

## 6. 路由与浏览器历史

项目没有使用 `react-router-dom`。`App.tsx` 使用 URL hash 和 History API 管理两个视图：

| URL | 视图或章节 |
| --- | --- |
| `/` | 首页顶部 |
| `/#story` | 三年三幕 |
| `/#quotes` | 教师名言 |
| `/#photos` | 记忆索引 |
| `/#gallery` | 完整图库 |

实现要点：

- `routeFromLocation()` 把 hash 解析为内部 `Route`；
- `pushState()` 写入菜单和按钮触发的导航；
- `popstate` 与 `hashchange` 支持浏览器前进、后退及直接深链；
- 查询参数会被保留；
- 路由完成后聚焦对应标题，方便键盘和读屏用户；
- 降动效环境使用即时滚动，其他环境使用原生平滑滚动；
- 图库使用 hash，因此静态托管不需要 SPA 路径重写规则。

名言档案、图库筛选条件和灯箱所选照片都属于组件本地状态，不写入 URL。刷新页面不会恢复这些状态。

如需新增首页章节，需要同步修改：

1. `NavigationTarget`；
2. `HomeSection`、`homeSections` 和 `focusTargetBySection`；
3. `SiteChrome.tsx` 的 `menuItems`；
4. `SeasonHome.tsx` 的 `sectionLinks` 和实际 section ID；
5. 路由单元测试与 Playwright 测试。

## 7. 照片数据与资源维护

### 7.1 当前资源规模

| 资源 | 数量 | 约占空间 |
| --- | ---: | ---: |
| 灯箱原图 | 137 | 16.33 MiB |
| 图库缩略图 | 137 | 5.75 MiB |
| 首页独立照片及响应式变体 | 11 | 0.89 MiB |

图库分类数量：

- 毕业现场：32；
- 师生合影：31；
- 校园日常：23；
- 活动瞬间：51。

### 7.2 两套编号必须区分

`galleryImages.ts` 同时存在两套编号：

- **展示编号**：数组位置 `001` 到 `137`，决定页面顺序、caption 和分类集合；
- **物理文件编号 / 稳定 ID**：从 `gallery-031.webp` 之类的文件名提取，决定 `GalleryImage.id`、原图和缩略图路径。

例如数组第一项使用物理文件 `gallery-031.webp`，但在页面中显示为“照片 001”。不要按文件名排序目录后直接覆盖数组，否则策展顺序、分类和测试都会变化。

物理文件编号覆盖 `001—139`，其中没有 `033` 和 `077`，因此实际文件数为 137。当前 12 张首页精选对应的物理文件 ID 为：

- 毕业现场：`031 / 083 / 138`；
- 师生合影：`100 / 106 / 101`；
- 校园日常：`090 / 131 / 085`；
- 活动瞬间：`036 / 125 / 096`。

### 7.3 `GalleryImage` 字段

```ts
type GalleryImage = {
  id: string
  src: string
  thumbnailSrc: string
  width: number
  height: number
  thumbnailWidth: number
  thumbnailHeight: number
  alt: string
  category: 'graduation' | 'portrait' | 'campus' | 'activity'
  caption: string
  featured: boolean
}
```

真实尺寸用于预留布局，不能填写估算值。尺寸错误会造成 CLS、错位或灯箱比例异常。

首页 12 张精选照片不是单独维护的数组，而是按当前展示顺序选取每个分类最先出现的 3 张：

```ts
featuredGalleryImages = galleryImages.filter((image) => image.featured)
```

调整数组顺序或分类时，首页精选也会跟着变化。

### 7.4 替换现有照片

1. 生成 WebP 原图并放到 `public/assets/gallery/`；
2. 生成对应缩略图并放到 `public/assets/gallery/thumbs/`；
3. 尽量保留原物理文件名，避免稳定 ID 变化；
4. 更新 `rawGalleryImages` 中的缓存版本，例如 `?v=20260823-1`；
5. 原图和缩略图都要更新缓存版本；
6. 如尺寸变化，把该物理 ID 移到正确的 `galleryDimensionGroups`；
7. 运行数据测试、图库测试和浏览器测试。

当前仅物理文件 `gallery-085` 的缩略图路径带单独版本参数；如继续替换图片，建议统一让原图与缩略图使用同一版本字段，减少遗漏。

### 7.5 新增或删除照片

当前没有自动生成图片清单和缩略图的脚本。新增或删除时需要手工同步：

- `rawGalleryImages`；
- `graduationPhotos`、`portraitPhotos`、`activityPhotos`，未列入前三者的照片自动归入校园日常；
- `galleryDimensionGroups`；
- 页面中硬编码的 `137`；
- `index.html`、README、单元测试和 E2E 断言。

可先运行以下命令查找所有硬编码计数：

```powershell
rg -n "\b137\b|\b103\b" README.md site
```

## 8. 教师名言数据维护

`teacherQuotes.ts` 中的 `rawTeacherQuotes` 是唯一完整数据源，当前保留 103 条原文。

生成后的结构：

```ts
type TeacherQuote = {
  id: string
  text: string
  author: string | null
  featured: boolean
}
```

规则：

- ID 由数组位置生成，例如 `quote-001`；
- 末尾形如 `正文——署名` 的内容会被拆成正文和署名；
- 没有匹配到末尾署名时，`author` 为 `null`；
- 首页精选由 `featuredQuoteIds` 固定选择；
- 当前精选 ID 为 `001、008、036、041、045、050、052、056、065、069、084、102`。

注意：名言 ID 依赖数组顺序。在数组中间插入、删除或重排内容会改变后续 ID，也会改变首页精选。维护时应重新核对 `featuredQuoteIds` 和测试。

如果名言总数发生变化，还要更新 `SeasonHome.tsx`、README、SEO 文案和测试里的硬编码 `103`。完整档案标题内部使用 `teacherQuotes.length`，会自动更新。

所有名言和署名都会随静态站点公开下载。发布新内容前应确认隐私、点名和公开授权。

## 9. 图片加载与性能策略

当前加载策略：

- `index.html` 预加载 Smiley Sans 和首张 Hero 的响应式图片；
- 首张 Hero 使用高优先级，后续 Hero 图片在切换前预载下一张；
- 首页故事和 12 张记忆索引使用懒加载；
- 完整图库只渲染缩略图，前 4 张 eager，其余 lazy；
- 灯箱打开后才请求当前原图；
- 灯箱预载相邻两张原图；
- 原图加载期间显示缩略图占位；
- 原图失败时保留预览并显示错误状态；
- 所有主要图片都写入宽高，降低布局偏移。

当前生产构建大约为：

- JavaScript：498 kB，gzip 约 166 kB；
- CSS：58 kB，gzip 约 12 kB。

后续如继续增加交互，优先拆分图库和名言档案代码，不要在首页初始加载更多原图。

## 10. 动效系统

### 10.1 入场动画

`IntroSequence.tsx` 使用 GSAP，设计目标是不阻塞用户：

- 当前标签页会话第一次进入时播放；
- `sessionStorage` key：`909:intro:season-v2`；
- 720ms 硬停止，避免动画卡住；
- 指针按下、滚轮或键盘输入会立即结束；
- `prefers-reduced-motion: reduce` 下完全跳过；
- timeline、定时器和监听器在卸载时清理。

开发时重播入场动画：

```js
sessionStorage.removeItem('909:intro:season-v2')
location.reload()
```

也可以直接新开一个标签页。普通刷新后不重复播放是预期行为，不是故障。

### 10.2 首页交互

`SeasonHome.tsx` 使用 Motion：

- Hero 图片拖拽、按钮和圆点切换；
- 弹簧过渡和按压缩放反馈；
- Hero 内容随原生滚动产生小幅位移与缩放；
- 中文标题使用 `Intl.Segmenter` 按字素拆分，保留完整读屏文本；
- 降动效时不执行拖拽视差和动画过渡。

### 10.3 GSAP 与 ScrollTrigger

- GSAP 负责入场和全屏目录时间线；
- 所有 GSAP 逻辑通过 `useGSAP({ scope })` 与 `gsap.matchMedia()` 清理；
- `ScrollTrigger` 当前主要用于统一注册和布局刷新；
- 当前没有章节 pin、滚轮劫持、Lenis 或自定义光标；
- 移动端和粗指针设备始终保持浏览器原生滚动。

## 11. 视觉系统与响应式规则

当前主视觉令牌位于 `index.css` 后半部分：

```css
--canvas: #f3f4f5;
--paper: #ffffff;
--ink: #111317;
--muted: #696d73;
--blue: #0067b1;
--blue-bright: #1687d3;
--signal: #ff453a;
--page-pad: clamp(22px, 4.2vw, 72px);
--content-max: 1560px;
```

设计原则：

- 暖灰白底色承载大面积内容；
- 校服蓝作为主品牌色；
- 红色只用于发车灯、状态和结尾强调；
- 大号数字、时间戳、赛季英文和细网格构成 F1 语言；
- 玻璃效果仅用于固定导航等需要分层的区域；
- 交互强调直接反馈，不依赖装饰性长动画。

当前主要响应式断点为 `1100px`、`760px` 和 `420px`，另有：

- `hover: none`：移除依赖 hover 的呈现；
- `prefers-reduced-motion: reduce`：关闭动画与平滑滚动；
- `prefers-reduced-transparency: reduce`：降低半透明和模糊；
- `env(safe-area-inset-*)`：适配 iPhone 安全区。

### CSS 技术债务

`index.css` 前半部分仍保留上一版视觉系统，当前重构样式从第 1900 行附近的注释 `2026 structured season rebuild` 开始在后半部分覆盖旧规则。因为 CSS 按源顺序生效，维护当前界面时应优先修改后半部分。

这是当前最明显的技术债务。后续如要清理，必须逐段删除旧样式并运行全视口截图审计，不能一次性删掉前半部分后直接发布。

## 12. 可访问性与输入方式

当前实现包含：

- `lang="zh-CN"`；
- 跳到主要内容链接；
- 语义化 heading、section、nav、figure、blockquote；
- 菜单、名言档案和灯箱的 `role="dialog"` 与 `aria-modal`；
- 模态打开后的背景 `inert` 和 `aria-hidden`；
- Tab / Shift+Tab 焦点循环；
- Escape 关闭；
- 关闭后焦点返回原触发按钮；
- 灯箱方向键切换；
- 灯箱触摸滑动，水平距离阈值为 52px；
- 当前页、当前幻灯片和筛选按钮状态；
- 名言、图片计数的 `aria-live`；
- 可见焦点和面向触摸设备放大的主要控制；
- 降动效和降透明度媒体查询。

修改布局后不要只用鼠标验收。至少完成一次纯键盘路径：菜单 → 章节 → 名言档案 → 图库 → 灯箱 → 返回触发点。

当前仍有几项需要后续修复的无障碍细节：

- 图库最终 alt 被统一生成为“909班毕业纪念照片 + 编号”，`rawGalleryImages` 中原始 alt 会被覆盖，尚未提供逐张有意义的描述；
- 自动视觉审计曾测得图库筛选按钮约 42px 高、移动端名言索引约 27×44px，未全部达到 44×44px；
- 菜单底部博客文字链接的可点击高度偏小；
- 程序化聚焦的章节标题没有额外可见轮廓，键盘用户主要依赖滚动位置感知变化；
- 当前 Playwright 只覆盖 Chrome，没有 Firefox、WebKit、真实 iOS Safari 或 axe 自动扫描。

## 13. 本地开发

首次安装：

```powershell
cd C:\Users\zongt\Documents\graduation-memorial-2022314\site
npm ci
```

启动开发服务器：

```powershell
npm run dev
```

局域网或手机联调：

```powershell
npm run dev -- --host 0.0.0.0
```

生产构建和本地预览：

```powershell
npm run build
npm run preview
```

生产文件输出到 `site/dist/`。不要手工编辑 `dist/`，任何修改都应回到 `src/` 或 `public/` 后重新构建。

`npm run preview` 只预览已有的 `dist/`，必须先运行 `npm run build`。`npm test` 会进入 Vitest watch 模式；CI、交接验收或一次性检查应使用 `npm run test:run`。

## 14. 测试与验收

### 14.1 常用命令

```powershell
npm run lint
npm run test:run
npm run test:e2e
npm run build
npm audit
```

连续运行 Vitest 与 Playwright：

```powershell
npm run test:all
```

注意：`test:all` 只串联 Vitest 与 Playwright，不包含 lint、production build 或依赖审计。正式发布不能只运行这一条命令。

当前单元测试基线为 4 个测试文件、15 条测试。最后一次重构验收覆盖 41 条浏览器项目路径；完整批次唯一出现过的是 4ms 入场时序边界，缩短硬停止时间后对应单项已复验通过。

### 14.2 Playwright 视口

| 项目 | 视口 | 重点 |
| --- | --- | --- |
| `desktop-1440` | 1440 × 900 | 桌面布局、键盘、resize、运行时降动效 |
| `tablet-768` | 768 × 1024 | 触摸平板布局 |
| `mobile-390` | 390 × 844 | 手机、触摸、入场、横向溢出 |
| `mobile-reduced-motion` | 390 × 844 | 降动效最终状态 |
| `wide-touch-1024` | 1024 × 768 | 粗指针宽屏、不产生 pin |

Playwright 配置使用系统 Chrome `channel: 'chrome'`。机器没有 Chrome 或版本不兼容时，先解决浏览器环境再判断测试失败。

E2E 会自动启动 `127.0.0.1:4173` 上的 Vite 开发服务器；本地配置允许复用该端口的现有服务。如果 4173 上残留旧 Vite 或 preview 进程，测试可能误测旧页面。失败 trace 位于 `node_modules/.cache/playwright-results/`，默认不保存截图和视频。

自动化通过不等于跨浏览器完成验收。重要发布仍应至少在真实 iPhone Safari 和一台 Android Chrome 上手工走一次菜单、图库和灯箱路径。

### 14.3 自动化覆盖

自动化当前覆盖：

- 首页全部章节和 12 张精选；
- 137 张图库顺序、真实尺寸和分类完整性；
- 103 条名言完整性与固定精选 ID；
- 菜单焦点锁、Escape 和章节导航；
- `#gallery` 直达及浏览器前进后退；
- 灯箱原图按需加载、相邻预载、键盘和触摸切换；
- 灯箱缩略图占位和原图失败回退；
- 模态焦点返回；
- 移动端原生滚动和无 pin spacer；
- 横向溢出、短横屏标题和移动端字体重叠；
- 入场只播放一次、可滚动、无 GSAP target 警告；
- 降动效状态和运行时偏好切换。

### 14.4 视觉审计

先构建并在 4173 端口预览生产文件：

```powershell
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

另开终端运行：

```powershell
npm run audit:visual -- visual-audit-output\handoff
```

脚本会生成多视口截图和 `report.json`，检查：

- 文本碰撞；
- 文本裁切；
- 横向溢出；
- 小于 44px 的交互目标；
- 控制台 warning、error 和 page error。

视觉审计脚本不会因为 `collisions`、`clippedText` 或 `tinyInteractive` 非空而自动返回失败状态；它是证据收集工具，必须人工阅读 `report.json` 并检查截图。隐藏读屏文本和装饰性大数字可能产生预期误报。

可用环境变量：

```powershell
$env:AUDIT_BASE_URL='https://2022314.xyz'
$env:AUDIT_PROFILES='desktop-1440,mobile-390'
$env:AUDIT_STOP_WAIT='500'
npm run audit:visual -- visual-audit-output\production
```

`visual-audit-output/` 已被 Git 忽略。

## 15. 发布到 Cloudflare Pages

### 15.1 发布前

```powershell
cd C:\Users\zongt\Documents\graduation-memorial-2022314\site
npm ci
npm run lint
npm run test:run
npm run test:e2e
npm run build
npm audit --audit-level=high
```

确认 Git：

```powershell
git status --short --branch
git pull --ff-only
git rev-parse HEAD
git push origin main
```

### 15.2 当前可靠发布流程：Direct Upload

1. 登录 Cloudflare Dashboard；
2. 打开 `Workers 和 Pages`；
3. 进入项目 `graduation-memorial-2022314`；
4. 新建部署，选择 Direct Upload；
5. 上传 `site/dist/` 的**内容**，不能把外层 `dist` 目录再包一层；
6. 确认选择 Production 部署；
7. 保存并部署；
8. 等待页面显示部署成功；
9. 先检查 `pages.dev` 地址，再检查 `2022314.xyz`。

Dashboard 直达地址：

```text
https://dash.cloudflare.com/64b2908c3ef53688cc3f5fb0dd5343e8/pages/view/graduation-memorial-2022314/deployments/new
```

如果界面要求 ZIP，可在 `site/` 目录执行：

```powershell
Compress-Archive -Path 'dist\*' -DestinationPath "$env:TEMP\909-release.zip" -CompressionLevel Optimal
```

每次使用新的 ZIP 文件名，避免本地旧压缩包与新构建混淆。

ZIP 根目录必须直接包含以下内容：

```text
index.html
assets/
fonts/
favicon.svg
```

如果 ZIP 内是 `dist/index.html`，说明多包了一层目录，部署后根路径会找不到入口文件。

当前 `dist` 约 23.55 MiB、291 个文件；压缩包约 23.23 MiB。Cloudflare Dashboard 拖拽上传限制约为 25 MiB / 1000 文件，现状距离 ZIP 大小上限只剩约 1.77 MiB。继续增加照片前必须压缩资源，或改用具备 API Token 的 Wrangler 上传流程。Wrangler 的目录上传上限高于 Dashboard ZIP（20,000 文件，单文件 25 MiB），且不接受 ZIP。

本机全局 Wrangler 当前为 4.124.0，但 CLI 尚未认证；浏览器中已登录 Cloudflare 不代表 Wrangler 已登录。如果由接手人配置了具备 Pages 权限的 API Token，可在 `site/` 中使用：

```powershell
wrangler pages deploy .\dist --project-name graduation-memorial-2022314
```

不要把 API Token 写入仓库或命令历史。Direct Upload 项目不能直接原地改成 Git integration；如要自动部署，可用 GitHub Actions 调用 Wrangler，或新建 Git 连接项目、迁移自定义域名并制定回滚方案。

### 15.3 发布后验证

检查自定义域名是否返回新资源：

```powershell
$url = 'https://2022314.xyz/?release=COMMIT_SHA'
$response = Invoke-WebRequest -UseBasicParsing -Uri $url -Headers @{ 'Cache-Control'='no-cache' }
$response.StatusCode
[regex]::Matches($response.Content, 'assets/index-[A-Za-z0-9_-]+\.(css|js)') |
  ForEach-Object { $_.Value } |
  Sort-Object -Unique
```

输出的资源名必须与刚才 `npm run build` 在 `dist/assets/` 生成的文件一致。

随后人工快速检查：

1. 首页 Hero 主图与标题；
2. 菜单打开、Escape 关闭；
3. `/#story`、`/#quotes`、`/#photos`、`/#gallery`；
4. 五个图库筛选；
5. 第一张灯箱、下一张、上一张、关闭；
6. 手机 390px 宽度无横向滚动；
7. 浏览器控制台无 error。

### 15.4 回滚

优先使用 Cloudflare Pages 部署历史中的上一条成功 Production 部署回滚：打开项目的 `Deployments`，在目标部署右侧菜单选择 `Rollback to this deployment`。Preview 部署不能直接作为生产回滚目标。

代码层面不要使用 `git reset --hard`：

1. 在 Git 中找到最后一个稳定提交；
2. 使用 `git revert <bad-commit>` 生成可追踪的回滚提交；
3. 重新构建并上传；
4. 再次核对自定义域名资源哈希。

## 16. 常见修改入口

| 需求 | 首要修改位置 | 还要检查 |
| --- | --- | --- |
| 更换首页三张轮播图 | `SeasonHome.tsx` 的 `heroSlides` | `public/assets`、移动图、宽高、`index.html` 预加载 |
| 修改三年三幕 | `SeasonHome.tsx` 的 `storyChapters` | 图片 alt、宽高、日期与视觉审计 |
| 修改课堂内外 | `SeasonHome.tsx` 的 `CampusSplit` | 首页精选数组索引是否仍正确 |
| 修改名言 | `teacherQuotes.ts` | 精选 ID、103 硬编码、数据测试 |
| 修改图库顺序 | `galleryImages.ts` 的 `rawGalleryImages` | 分类集合、展示编号、精选图和测试 |
| 修改图库分类 | 三个分类 Set | 首页每类前 3 张精选和分类数量 |
| 修改菜单 | `SiteChrome.tsx` 的 `menuItems` | `App.tsx` 路由和路由测试 |
| 修改 SEO / 分享图 | `site/index.html` | 绝对生产 URL、缓存和图片比例 |
| 修改颜色和排版 | `index.css` 后半部分的当前令牌与规则 | 所有视口、降透明度和旧样式覆盖关系 |
| 修改入场动画 | `IntroSequence.tsx`、`introState.ts` | 1.2s E2E 上限、用户输入可立即结束、降动效 |
| 修改博客地址 | `SeasonHome.tsx`、`SiteChrome.tsx` | 路由测试与 E2E |

## 17. 常见故障排查

### 打开网站后没有入场动画

这是最常见的误判。入场动画只在当前标签页会话第一次播放。清除 `sessionStorage` 中的 `909:intro:season-v2` 或新开标签页再验证。系统开启“减少动态效果”时动画必然跳过。

### 移动端无法滚动

先检查：

- 页面上是否仍有菜单、名言档案或灯箱弹层；
- `body[data-modal-open]` 是否在弹层关闭后残留；
- `body` 或 `html` 是否残留 `overflow: hidden`；
- `useModalDialog`、`SiteChrome` 的 effect cleanup 是否被修改；
- 是否意外新增了 pin、全屏 fixed 遮罩或滚轮监听器。

### 线上看起来没有更新

1. 确认执行过 `npm run build`；
2. 确认上传的是新的 `dist/*`；
3. 用提交 SHA 作为查询参数打开站点；
4. 比较线上 HTML 和本地 `dist/assets` 的 hash；
5. 记住 Git push 不会自动触发当前 Pages 项目部署。

同名照片和 Hero 静态资源比带内容 hash 的 CSS/JS 更容易命中旧缓存；当前线上静态资源缓存时间约为 4 小时。替换同名图片时优先修改查询版本，必要时再清理 Cloudflare Cache。

### Cloudflare OAuth 回调停在 `localhost:8976`

这表示 CLI 的本地 OAuth 回调服务没有正常接收请求，不是网站问题。当前已验证的发布方式是使用已登录的 Cloudflare Dashboard 直接上传，不依赖这条 OAuth 流程。

### `/#gallery` 可用但 `/gallery` 返回 404

这是 Hash 路由的预期行为。正式入口是 `/#gallery`，不是 `/gallery`。除非同时重构路由并配置 Cloudflare fallback，否则不要把站内链接改为路径路由。

### Playwright 测到了旧页面

确认 `127.0.0.1:4173` 没有残留的 Vite 或 preview 进程。当前配置会复用已有服务器，端口上的旧页面也可能让测试看似正常启动。

### 图片显示错误、方向不对或布局跳动

- 检查 `src` 是否指向正确物理文件；
- 检查缩略图是否与原图对应；
- 检查该物理 ID 所在的尺寸分组；
- 检查宽高是否为真实像素；
- 检查缓存版本参数是否同时更新；
- 不要把展示编号当成物理文件编号。

### 图库原图一打开就全部下载

正常实现只应先加载缩略图，原图由 `PhotoLightbox` 打开后请求。如果网络面板显示首页请求全部原图，检查是否把 `image.src` 错用到图库网格，或新增了全量预载逻辑。

### 字体重叠或文字裁切

- 优先检查 `index.css` 后半部分当前规则；
- 在 390×844、768×1024、1440×900 和短横屏复现；
- 等待 `document.fonts.ready` 后再判断；
- 运行视觉审计并查看 `collisions` 与 `clippedText`；
- 不要只调字号，还要检查 `line-height`、容器高度、`overflow` 和 `white-space`。

## 18. 已知风险和技术债务

1. **CSS 双层历史规则**：当前样式依靠后半部分覆盖旧版规则，维护成本较高；旧的 `memory-console`、`memory-stage` 等规则仍存在；
2. **部分动画触发布局或偏慢**：旧菜单规则动画 `padding`，章节轨道动画 `width`，图库和记忆卡片有 320–600ms 的缩放、阴影或 filter；后续应改为精细指针下 200–250ms 的 `transform/opacity`；
3. **降动效仍有 Motion 按压缩放**：若要严格满足降动效，应在 `useReducedMotion()` 为真时移除 `whileTap` 位移；
4. **内容计数硬编码**：`103` 和 `137` 出现在多个组件、SEO、README 和测试；
5. **图库清单手工维护**：没有图片导入、尺寸检测和缩略图生成脚本；
6. **图库 DOM 很长**：137 个条目一次挂载；图片虽懒加载，低内存移动设备仍可能承受较大布局成本；
7. **精选照片没有上下文延续**：首页 12 张卡片都会进入图库顶部，不会定位或直接打开所点击照片；
8. **名言档案 DOM 较重**：桌面和移动背景流同时存在，并复制全部名言，连同 103 条正文一起挂载；
9. **名言 ID 依赖顺序**：中间插入内容会改变后续 ID；
10. **章节当前状态存在两套来源**：左侧轨道跟随实际滚动，全屏菜单的当前项跟随 URL hash；手动滚动后两者可能暂时不一致；
11. **Direct Upload**：GitHub 与生产环境不是自动同步，且当前 ZIP 已接近 Dashboard 25 MiB 上限；
12. **大组件**：`SeasonHome.tsx` 集中承载首页所有章节，继续扩展前应拆分；
13. **初始 JS 仍可拆分**：图库和名言弹层可以使用动态 import；
14. **公开内容风险**：静态站点中的照片、名言和署名没有访问控制；
15. **视觉审计有预期误报**：隐藏读屏文案和装饰性大数字可能被报告为裁切或重叠，报告必须与截图一起人工判断；
16. **跨浏览器覆盖不足**：自动测试只跑 Chrome；
17. **长文案字体风险**：精选名言也使用展示字体时，若字体文件是固定文案子集，会产生逐字回退；
18. **视觉审计依赖本机 Chrome 路径**：非 Windows 或 Chrome 安装位置不同需要设置 `PLAYWRIGHT_CHROME_PATH`；
19. **遗留配置和未用工具**：`.env.example` 中的 `VITE_API_*` 已无引用，`supportsDesktopFinePointerMotion()` 当前也未使用；
20. **缺少发布可追踪信息**：线上 HTML 不包含 Git SHA，当前只能通过构建资源 hash 间接核对版本；
21. **缺少安全与缓存配置文件**：没有 `_headers`、自定义 CSP 或仓库内缓存策略；
22. **部署路径假设固定**：图片和字体使用 `/assets`、`/fonts` 根路径，默认部署在域名根目录；
23. **没有监控或告警**：没有错误收集、统计分析或可用性监控；
24. **没有 CI**：测试、构建、审计和发布仍依赖维护者手动执行。

建议后续优先级：

1. 修正触摸目标、逐图 alt、降动效按压和偏慢/触发布局的动画；
2. 建立 GitHub Actions，至少自动运行 lint、Vitest、Playwright 和 build；
3. 为图库建立清单生成与缩略图脚本；
4. 让首页精选照片把对应照片 ID 带入图库或直接打开灯箱；
5. 把所有展示计数改成从数据派生；
6. 拆分并清理 `index.css` 的旧样式；
7. 虚拟化长图库，并减少名言档案的重复装饰 DOM；
8. 拆分 `SeasonHome.tsx` 和弹层代码；
9. 评估是否把 Cloudflare Pages 连接到 Git 自动部署。

## 19. 发布检查清单

### 内容

- [ ] 首页主图、移动主图和 alt 正确；
- [ ] 三年三幕图片与文案正确；
- [ ] 首页精选 12 张、完整图库 137 张；
- [ ] 首页精选 12 条、完整名言 103 条；
- [ ] 分类数量与筛选结果一致；
- [ ] 博客、生产域名和分享图链接正确。

### 功能

- [ ] 首页原生滚动正常；
- [ ] 入场不会阻塞触摸或滚轮；
- [ ] 菜单焦点锁、Escape 和焦点返回正常；
- [ ] 四个 hash 深链和前进后退正常；
- [ ] 名言档案可打开、关闭；
- [ ] 灯箱按钮、方向键、触摸滑动和错误回退正常；
- [ ] 手机无横向溢出。

### 工程

- [ ] `npm ci` 成功；
- [ ] `npm run lint` 成功；
- [ ] `npm run test:run` 成功；
- [ ] `npm run test:e2e` 成功；
- [ ] `npm run build` 成功；
- [ ] `npm audit --audit-level=high` 无高危问题；
- [ ] Git 工作区无意外文件；
- [ ] 提交已推送到 `origin/main`。

### 线上

- [ ] Cloudflare 部署显示成功；
- [ ] `pages.dev` 地址正确；
- [ ] `2022314.xyz` 返回 HTTP 200；
- [ ] 线上资源 hash 与本地构建一致；
- [ ] 桌面与手机完成快速验收；
- [ ] 控制台无 error。

## 20. 交接所需权限

接手人需要自行确认以下权限。任何密码、Token 或密钥都不应写入仓库：

- GitHub 仓库的读写权限；
- Cloudflare account 中 Pages 项目的部署权限；
- `2022314.xyz` 的 DNS / 自定义域名管理权限；
- 如需更换博客入口，需要 `zongtech.xyz` 的维护协调权限；
- 所有新增照片、名言和署名的公开发布授权。

## 21. 最短维护流程

对常规内容修改，推荐始终按以下顺序：

```text
修改 src/public
  → 本地查看桌面和手机
  → lint
  → Vitest
  → Playwright
  → production build
  → npm audit
  → Git 提交并推送
  → Cloudflare Direct Upload
  → 比较线上资源 hash
  → 线上菜单、图库、灯箱快速验收
```

如果只记住一件事：**GitHub 上的最新代码不等于当前线上版本；必须以 Cloudflare 部署记录和线上资源 hash 为准。**
