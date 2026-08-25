"use client";

import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { GripVertical, RotateCcw } from "lucide-react";
import type { Option } from "@/lib/types";

const RANK_BADGES = [
  "bg-indigo-600",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-slate-400",
  "bg-slate-500",
  "bg-slate-600",
];

interface RankingBoardProps {
  options: Option[];
  order: string[];
  onReorder: (newOrder: string[]) => void;
  onReset: () => void;
  touched: boolean;
}

export default function RankingBoard({
  options,
  order,
  onReorder,
  onReset,
  touched,
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

  return (
    <div>
      {/* 图例 */}
      <div className="mb-3 flex items-center justify-between text-xs font-medium text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          最倾向 / 最符合（Rank 1）
        </span>
        <span className="inline-flex items-center gap-1.5">
          最不倾向 / 最不符合（Rank 6）
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
                      {...provided.dragHandleProps}
                      style={provided.draggableProps.style}
                      className={`group flex items-center gap-3 rounded-2xl border bg-white p-3.5 pr-3 transition-shadow ${
                        snapshot.isDragging
                          ? "border-indigo-300 shadow-float ring-2 ring-indigo-200"
                          : "border-slate-200 hover:border-indigo-200"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm ${RANK_BADGES[i]}`}
                      >
                        {i + 1}
                      </span>
                      <p className="flex-1 text-sm leading-relaxed text-slate-700">
                        {opt.text}
                      </p>
                      <GripVertical className="h-5 w-5 shrink-0 cursor-grab text-slate-300 transition-colors group-hover:text-slate-400 active:cursor-grabbing" />
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
