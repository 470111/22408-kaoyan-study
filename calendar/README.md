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

## GitHub Pages

仓库已配置 `base: /22408-kaoyan-study/calendar/`，推送后访问：

https://470111.github.io/22408-kaoyan-study/calendar/

## 计分规则

与 [11h-7-12月方案.md](../11h-7-12月方案.md) 一致：6月 3.75+3.25+1；7.1–10.10 为 5+5+1.5；10.11 起含政治 4+4+1.5+1.5。
