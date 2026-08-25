"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

export default class ReportErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    console.error("报告渲染异常:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <p className="text-lg font-semibold text-slate-900">报告加载失败，可能是缓存了旧版本数据</p>
          <p className="mt-2 text-sm text-slate-500">请清理缓存后重新测评，即可生成最新版报告。</p>
          <div className="mt-6 flex gap-3">
            <a href="/" className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">
              前往选轨页重新测评
            </a>
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.localStorage.removeItem("fyi_result");
                  window.location.reload();
                }
              }}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              清理缓存并刷新
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
