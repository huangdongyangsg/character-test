"use client";

import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  RotateCcw,
} from "lucide-react";
import type { Option } from "@/lib/types";

const RANK_BADGES = [
  "bg-indigo-600",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-violet-400",
  "bg-slate-400",
  "bg-slate-500",
  "bg-slate-600",
  "bg-slate-700",
];

interface RankingBoardProps {
  options: Option[];
  order: string[];
  onReorder: (newOrder: string[]) => void;
  onReset: () => void;
}

export default function RankingBoard({
  options,
  order,
  onReorder,
  onReset,
}: RankingBoardProps) {
  const byId = new Map(options.map((o) => [o.id, o]));
  const items = order
    .map((id) => byId.get(id))
    .filter((o): o is Option => Boolean(o));

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;
    const newOrder = Array.from(order);
    const [removed] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, removed);
    onReorder(newOrder);
  };

  /** 点击上下按钮移动一位（移动端/无障碍的可靠替代） */
  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const newOrder = Array.from(order);
    [newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]];
    onReorder(newOrder);
  };

  return (
    <div>
      {/* 图例 */}
      <div className="mb-3 flex items-center justify-between text-xs font-medium text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          最倾向 / 最符合（Rank 1）
        </span>
        <span className="inline-flex items-center gap-1.5">
          最不倾向 / 最不符合（Rank 8）
          <span className="h-2 w-2 rounded-full bg-slate-500" />
        </span>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="ranking-list">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-2.5"
            >
              {items.map((opt, i) => (
                <Draggable key={opt.id} draggableId={opt.id} index={i}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={provided.draggableProps.style}
                      className={`flex items-center gap-2.5 rounded-2xl border bg-white p-3 transition-shadow ${
                        snapshot.isDragging
                          ? "border-indigo-300 shadow-float ring-2 ring-indigo-200"
                          : "border-slate-200 hover:border-indigo-200"
                      }`}
                    >
                      {/* 独立拖拽手柄（仅此处可拖拽，避免与滚动/点击冲突） */}
                      <span
                        {...provided.dragHandleProps}
                        aria-label="拖拽排序"
                        className="flex h-10 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-slate-300 transition-colors hover:text-slate-500 active:cursor-grabbing"
                      >
                        <GripVertical className="h-5 w-5" />
                      </span>

                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm ${RANK_BADGES[i]}`}
                      >
                        {i + 1}
                      </span>

                      <p className="min-w-0 flex-1 text-sm leading-relaxed text-slate-700">
                        {opt.text}
                      </p>

                      {/* 上移 / 下移（移动端点击即可完成排序） */}
                      <div className="flex shrink-0 flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => move(i, -1)}
                          disabled={i === 0}
                          aria-label="上移一位"
                          className="flex h-8 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => move(i, 1)}
                          disabled={i === items.length - 1}
                          aria-label="下移一位"
                          className="flex h-8 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <button
        onClick={onReset}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        <RotateCcw className="h-4 w-4" />
        一键重置排序
      </button>
    </div>
  );
}

