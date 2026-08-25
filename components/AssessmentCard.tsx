"use client";

import {
  ArrowRight,
  Code2,
  GraduationCap,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Track } from "@/lib/types";
import { FYI_DIMENSIONS } from "@/lib/fyiDimensions";

const ICONS: Record<string, LucideIcon> = {
  campus: GraduationCap,
  sales: TrendingUp,
  tech: Code2,
  leadership: Users,
};

interface AssessmentCardProps {
  track: Track;
  onStart: (track: Track) => void;
  featured?: boolean;
}

export default function AssessmentCard({
  track,
  onStart,
  featured = false,
}: AssessmentCardProps) {
  const Icon = ICONS[track.id] ?? Users;

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-3xl border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover ${
        featured
          ? "border-indigo-200 shadow-card"
          : "border-slate-200/80 shadow-card"
      }`}
    >
      {/* 顶部渐变色条 */}
      <div
        className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${track.theme.gradient}`}
      />

      <div className="mb-5 flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${track.theme.gradient} text-white shadow-float`}
        >
          <Icon className="h-6 w-6" strokeWidth={1.8} />
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${track.theme.chip}`}
        >
          {track.audience}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-slate-900">{track.name}</h3>
      <p className={`text-sm font-medium ${track.theme.text}`}>
        {track.enName}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        {track.description}
      </p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {track.dimensions.map((key) => (
          <span
            key={key}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${track.theme.chip}`}
          >
            {FYI_DIMENSIONS[key]?.label ?? key}
          </span>
        ))}
      </div>

      <button
        onClick={() => onStart(track)}
        className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all ${track.theme.button} focus:outline-none focus:ring-2 focus:ring-offset-2`}
      >
        开始测评
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}
