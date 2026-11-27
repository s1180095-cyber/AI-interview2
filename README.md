# AI 面试助手 · 交互网站

根据提供的 4 张 App 截图（首页、AI 题库、面试中、面试结果报告）还原的可交互网页原型。纯 HTML / CSS / JavaScript，无构建步骤，可直接部署到 GitHub Pages。

## 本地运行

直接双击 `index.html` 即可在浏览器中打开。也可启动本地服务器：

```bash
cd /Users/yolanda/CodeBuddy/20261125
python3 -m http.server 8000
```

然后访问 <http://localhost:8000>。

## 部署到 GitHub Pages

1. 在 GitHub 新建一个仓库（例如 `ai-interview-demo`）。
2. 将本文件夹中的 `index.html`、`css/`、`js/`、`assets/` 上传到仓库根目录。
3. 打开仓库 **Settings → Pages**，将 **Source** 设置为 `Deploy from a branch`，Branch 选择 `main`、目录选择 `/ (root)`，保存。
4. 等待约 1 分钟后访问 `https://<你的用户名>.github.io/<仓库名>/`。

> 若使用自定义域名或子路径，所有资源均为相对路径，无需额外配置。

## 包含的页面与交互

| 页面 | 主要功能 |
| --- | --- |
| 首页 | 开始 AI 模拟面试、今日进度统计、即将开始的面试提醒、核心功能入口 |
| AI 题库 | 分类切换（技术类/行为类/HR面/群面）、关键词搜索、今日练习进度、题目收藏、随机练习 |
| 面试中 | AI 面试官语音动画、题目展示、录音/暂停切换、计时器、回答输入（2000 字计数）、提交回答生成报告 |
| 面试结果报告 | 综合评分仪表盘、能力维度雷达图、维度得分柱状图（可切换本次/上次面试）、表现亮点、改进建议、AI 评语、分享与辅导入口 |
| 辅助页面 | 学习中心、我的收藏、个人中心，底部导航完整可用 |

其他交互：弹层确认、Toast 提示、收藏状态本地保存（localStorage）、响应式手机外框（桌面端居中显示）。

## 目录结构

```
.
├── index.html          # 页面结构
├── css/style.css       # 全部样式
├── js/app.js           # 交互逻辑
├── assets/             # 从截图中提取的头像与插画素材
│   ├── brain-orb.png
│   ├── interviewer.png
│   ├── laptop.png
│   ├── user-avatar.png
│   └── screens/        # 原始参考截图
└── README.md
```
