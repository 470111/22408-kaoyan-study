# 22408 学习日历

月视图打卡：点击任务划掉变灰，按权重计算日/月/阶段百分制得分。

## 本地运行

```bash
cd calendar
npm install
npm run dev
```

浏览器打开终端显示的地址（通常 http://localhost:5173）。

## 构建

```bash
cd calendar
npm run build
```

产物在 `calendar/dist/`。更新日表 md 后重新 build 会先运行 `scripts/parse-schedule.mjs` 生成 `public/data/tasks.json`。

## GitHub Pages（在线日历）

**代码已在仓库**：[github.com/470111/22408-kaoyan-study/tree/master/calendar](https://github.com/470111/22408-kaoyan-study/tree/master/calendar)

**网页地址**（需先完成下方一次性设置）：

https://470111.github.io/22408-kaoyan-study/calendar/

### 一次性设置（若打开是 404）

1. 打开仓库 **Settings → Pages**
2. **Build and deployment → Source** 选 **Deploy from a branch**
3. **Branch** 选 `gh-pages`，文件夹选 **/ (root)**，点 Save
4. 打开 **Actions**，运行一次 **Deploy Calendar to GitHub Pages**（或 push 任意 commit 触发）
5. 等 1–3 分钟后再访问上面的链接

> 若 Source 已是 **GitHub Actions**，也可保留；本仓库会往 `gh-pages` 分支的 `calendar/` 目录发布静态文件。

## 计分规则

与 [11h-7-12月方案.md](../11h-7-12月方案.md) 一致：6月 3.75+3.25+1；7.1–10.10 为 5+5+1.5；10.11 起含政治 4+4+1.5+1.5。
