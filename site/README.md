# 909「青春赛季」

深圳市龙华区高峰学校 2025 届 909 班毕业纪念站。项目使用 React、TypeScript、Vite、Motion 与 GSAP，包含滚动叙事首页、103 条教师名言档案和 137 张照片图库。

完整架构、内容维护、测试、Cloudflare 发布和故障排查说明见 [`../docs/HANDOFF.md`](../docs/HANDOFF.md)。

## 本地开发

```powershell
npm ci
npm run dev
```

## 完整验证

```powershell
npm run lint
npm run test:run
npm run test:e2e
npm run build
npm audit
```

也可以使用 `npm run test:all` 连续执行 Vitest 与 Playwright。Playwright 覆盖桌面、平板、手机和降动效环境。

生产构建输出至 `dist/`。标题展示字体为 Smiley Sans 的站点文案子集，授权文件位于 `public/fonts/OFL.txt`。
