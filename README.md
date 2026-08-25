# 职场胜任力测评 SaaS

一个现代、专业的端到端职场性格与胜任力测评 Web 应用，底层理论、题库设计、计分模型与面试分析报告**深度基于权威胜任力行为模型**。

## ✨ 核心特性

- **4 套分轨测评（Track Matrix）**：校招/管培生潜能版、社招业务与增长版、社招产研与技术版、团队管理与领导力版，每套聚焦 8 个胜任力维度。
- **动态抽题引擎**：每套内置 16 道高水准情境题种子库，开始测评时随机抽取并打乱题目与选项顺序，确保不同候选人题目不完全相同。
- **迫选题设计**：每道题是一个高保真职场两难/多目标冲突情境，8 个行动选项严格一一对应 8 大维度，且全部具备职场合理性与社会赞许性平衡，迫使候选人暴露真实行为倾向优先级。
- **流畅拖拽排序**：基于 `@hello-pangea/dnd` 实现顺滑手势拖拽、序号实时更新、一键重置，并支持上移/下移按钮（移动端友好）。
- **Borda 计分**：Rank 1 得 8 分 … Rank 8 得 1 分，累计后标准化为 0–100 指数。
- **高管人才画像总览看板（8 大模块）**：
  1. 高管画像卡（核心标签 + 一句话总结 + Top 4 环形进度卡）
  2. 全维度行为指数（水平指数条 + 雷达图，按优势/稳健/发展区分色）
  3. 四大职场元动力（决策逻辑 / 管理协同 / 沟通冲突 / 底层驱动）
  4. 核心优势与过载风险（Overuse Risks）
  5. 潜在短板与代偿盲点
  6. 角色与工作环境匹配度矩阵
  7. 答题真实性与一致性防作弊指数
  8. HR & 面试官 STAR 追问工具箱（Green Flag / Red Flag）
- **导出与分享**：一键导出/打印、复制 HR 摘要、发送报告到邮箱。

## 🧱 技术栈

Next.js (App Router) · TypeScript · Tailwind CSS · Lucide React · Recharts · @hello-pangea/dnd

## 🚀 快速开始

```bash
npm install
npm run dev        # 本地开发 http://localhost:3000
npm run build      # 生产构建
npm start          # 运行生产构建
npm run typecheck  # 仅类型检查
```

无需配置任何外部 API，可直接在本地运行出完整结果。

## 📁 项目结构

```
app/
  page.tsx                       # Landing & 选轨页
  layout.tsx                     # 根布局
  globals.css                    # 全局样式
  assessment/[trackId]/page.tsx  # 答题页（单题迫选拖拽排序）
  report/page.tsx                # 报告页
components/
  AssessmentCard.tsx             # 测评套件卡片（Bento Grid）
  RankingBoard.tsx               # 拖拽排序板（含上移/下移）
  ReportView.tsx                 # 高管人才画像总览看板
lib/
  types.ts                       # 全局类型
  fyiDimensions.ts               # 胜任力维度内容库（31 个维度）
  tracks.ts                      # 4 套测评套件元数据
  questionBank.ts                # 题库 + 动态抽题引擎
  scoring.ts                     # Borda 计分 + 一致性指数
  reportGenerator.ts             # 报告生成与推导逻辑
  storage.ts                     # 会话与结果持久化
```

## 🧠 计分模型

对每个维度 `key`，累计所有题目的 Borda 分：

```
points = rankCount - (rank - 1)   // rank1=8 ... rank8=1
normalized = round((raw - n) / ((rankCount - 1) * n) * 100)   // n = 题目数
```

一致性指数基于各维度跨题目排名标准差计算，并检测「直线作答」异常模式。

## ➕ 如何扩展题库

1. 在 `lib/tracks.ts` 中新增/调整套件的 8 个 `dimensions`。
2. 在 `lib/fyiDimensions.ts` 中补充对应维度的理论内容（定义、优势、过载风险、盲点、发展建议、面试追问）。
3. 在 `lib/questionBank.ts` 的 `QUESTION_POOL[trackId]` 中追加 `q(trackId, id, scenario, [8 个选项])`。
4. 调整 `QUESTIONS_PER_ASSESSMENT` 控制每次抽取题数。

## ⚠️ 说明

测评结果仅作为招聘与人才发展的辅助参考，不构成唯一决策依据。

