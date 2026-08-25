# FYI 职场胜任力测评 SaaS

一个现代、专业的端到端职场性格与胜任力测评 Web 应用，底层理论、题库设计、计分模型与面试分析报告**严格贯穿并深度基于 Korn Ferry《FYI: For Your Improvement》胜任力模型**。

## ✨ 核心特性

- **4 套分轨测评（Track Matrix）**：校招/管培生潜能版、社招业务与增长版、社招产研与技术版、团队管理与领导力版，每套聚焦 6 个 FYI 胜任力维度。
- **动态抽题引擎**：每套内置 8 道高水准情境题种子库，开始测评时随机抽取并打乱题目与选项顺序，确保不同候选人题目不完全相同。
- **FYI 迫选题设计**：每道题是一个高保真职场两难/多目标冲突情境，6 个行动选项严格一一对应 6 大维度，且全部具备职场合理性与社会赞许性平衡，迫使候选人暴露真实行为倾向优先级。
- **流畅拖拽排序**：基于 `@hello-pangea/dnd` 实现顺滑手势拖拽、序号实时更新、一键重置。
- **Borda 计分**：Rank 1 得 6 分 … Rank 6 得 1 分，累计后标准化为 0–100 指数。
- **面试官洞察报告**：
  - 多维雷达图 + 柱状图（Recharts）
  - Top 2 核心优势 + 过载风险（Overuse Risk）
  - Bottom 2 潜在盲点 / 发展区 + 发展建议
  - 面试官 STAR 追问指南（含 Green Flag / Red Flag）
  - 导出/打印报告、复制面试摘要

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
  RankingBoard.tsx               # 拖拽排序板
  ReportView.tsx                 # 面试官洞察报告
lib/
  types.ts                       # 全局类型
  fyiDimensions.ts               # FYI 维度内容库（24 个维度）
  tracks.ts                      # 4 套测评套件元数据
  questionBank.ts                # 题库 + 动态抽题引擎
  scoring.ts                     # Borda 计分与标准化
  reportGenerator.ts             # FYI 报告生成逻辑
  storage.ts                     # 会话与结果持久化
```

## 🧠 计分模型

对每个维度 `key`，累计所有题目的 Borda 分：

```
points = 6 - (rank - 1)   // rank1=6 ... rank6=1
normalized = round((raw - n) / (5 * n) * 100)   // n = 题目数
```

## ➕ 如何扩展题库

1. 在 `lib/tracks.ts` 中新增/调整套件的 6 个 `dimensions`。
2. 在 `lib/fyiDimensions.ts` 中补充对应维度的理论内容（定义、优势、过载风险、盲点、发展建议、面试追问）。
3. 在 `lib/questionBank.ts` 的 `QUESTION_POOL[trackId]` 中追加 `q(trackId, id, scenario, [6 个选项])`。
4. 调整 `QUESTIONS_PER_ASSESSMENT` 控制每次抽取题数。

## ⚠️ 说明

测评结果仅作为招聘与人才发展的辅助参考，不构成唯一决策依据。
