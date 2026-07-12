# Gonglab

公基（公共基础知识）考试备考工具 —— 知识库浏览 · 章节刷题 · 模拟考试 · 错题复习，全功能本地运行，无需后端。

> **声明**：本项目仅供学习参考，内容为示例数据，不包含任何考试真题或敏感信息。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **图标**: Lucide Icons
- **数据**: JSON（题库）+ 内置文章索引（知识库）
- **存储**: 浏览器 localStorage（无后端、无数据库）
- **部署**: Vercel / 自有服务器

## 功能

| 模块 | 说明 |
|------|------|
| 知识库 | 10 大学科、40+ 章节，可浏览知识点、星标收藏 |
| 章节刷题 | 按学科/章节逐题作答，即时判对错 + 解析 |
| 模拟考试 | 内置套卷 + 自定义试卷（手动配置学科/题型占比 + 总题数） |
| 错题本 | 自动收录错题，按学科分类，答对自动移出 |
| 管理后台 | 导入/导出题库 JSON、管理自定义文章 |
| AI 题库生成 | `scripts/gen-questions.mjs` 一键批量生成题目 |

![](png\首页.png)

![](png\知识库.png)

![](png\模拟考.png)
![](png\错题本.png)

![](png\手动导入界面.png)

## 快速开始

```bash
# 1. 安装依赖
npm install --cache ./node_cache

# 2. 启动开发服务器
npm run dev

# 3. 浏览器打开
# http://localhost:3000
```

## 部署

### Vercel（推荐）

将项目推送到 GitHub，在 [Vercel](https://vercel.com) 导入仓库即可自动部署。

### 自有服务器

```bash
npm install --cache ./node_cache
npm run build
npm start          # 默认 localhost:3000，可用 nginx 反向代理
```

> ⚠️ 本项目有动态路由，不能直接当纯静态站点托管。

## 目录结构

```
├── content/knowledge/     # 知识库 MDX 文章（待接入）
├── data/
│   ├── questions/         # 题库 JSON（按学科分文件）
│   └── exams/             # 内置试卷 JSON
├── scripts/
│   └── gen-questions.mjs  # AI 批量生成题目脚本
├── src/
│   ├── app/               # Next.js 页面路由
│   │   ├── knowledge/     # 知识库
│   │   ├── practice/      # 刷题
│   │   ├── exam/          # 模拟考（含 create 自定义）
│   │   ├── wrong/         # 错题本
│   │   ├── admin/         # 管理后台
│   │   └── search/        # 搜索
│   ├── components/        # 通用组件
│   ├── lib/               # 工具模块
│   │   ├── constants.ts   # 学科/章节定义
│   │   ├── storage.ts     # localStorage 数据管理
│   │   ├── questions.ts   # 题库加载
│   │   ├── exam-engine.ts # 考试引擎（判分/计时）
│   │   ├── content.ts     # 知识库文章索引
│   │   └── bookmarks.ts   # 书签工具
│   └── context/           # React Context
└── next.config.js
```

## 添加题库

直接在 `data/questions/<学科>.json` 中按格式追加题目：

```json
{
  "id": "law-constitution-001",
  "type": "单选",
  "category": "law",
  "subcategory": "constitution",
  "question": "全国人民代表大会每届任期几年？",
  "options": ["三年", "四年", "五年", "六年"],
  "answer": 2,
  "explanation": "根据宪法规定，全国人大每届任期五年。",
  "difficulty": "易",
  "frequency": "高频"
}
```

支持题型：`单选`、`多选`、`不定项`、`判断`。

## AI 批量生成题目

```bash
# 预览章节结构（不消耗 API）
node scripts/gen-questions.mjs --parse-only

# 全部学科批量生成（每章 10 题）
OPENAI_API_KEY=sk-xxx \
OPENAI_BASE_URL=https://api.deepseek.com/v1 \
MODEL=deepseek-chat \
node scripts/gen-questions.mjs

# 只生成法律，每章 15 题
OPENAI_API_KEY=sk-xxx node scripts/gen-questions.mjs --cat law --per 15
```

支持 OpenAI / DeepSeek / 通义千问 兼容端点。详见 `.env.example`。

## License

MIT
