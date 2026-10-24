import React from 'react';
import {
  Activity,
  Clock,
  MessageSquare,
  Zap,
  FilterX,
  Sliders,
  Award,
} from 'lucide-react';

interface HeaderProps {
  elapsedSeconds: number;
  turnsCount: number;
  averageFluency: number | null;
  fillersCount: number;
  onOpenSettings: () => void;
  onOpenReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  elapsedSeconds,
  turnsCount,
  averageFluency,
  fillersCount,
  onOpenSettings,
  onOpenReport,
}) => {
  const formatTime = (totalSec: number) => {
    const mins = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const secs = String(totalSec % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const fluencyColorClass =
    averageFluency === null
      ? 'text-slate-400'
      : averageFluency >= 80
      ? 'text-emerald-400'
      : averageFluency >= 65
      ? 'text-amber-400'
      : 'text-rose-400';

  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-slate-800/80 px-3 sm:px-6 py-2.5">
      <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo & Status */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-500 to-cyan-400 shadow-lg shadow-indigo-500/25">
            <Activity className="w-5 h-5 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-indigo-200 to-cyan-300 bg-clip-text text-transparent">
                NovaSpeak AI
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Live Coach
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              24/7 Personal Spoken English & Fluency Partner
            </p>
          </div>
        </div>

        {/* Live Session Fluency Metrics Bar */}
        <div className="flex items-center gap-2 sm:gap-4 bg-slate-900/90 border border-slate-800/90 rounded-2xl px-3 py-1.5 text-xs">
          <div
            className="flex items-center gap-1.5 pr-2 sm:pr-3 border-r border-slate-800"
            title="Session Call Duration"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono font-semibold text-slate-200">
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          <div
            className="flex items-center gap-1.5 pr-2 sm:pr-3 border-r border-slate-800"
            title="Speaking Turns Completed"
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 hidden md:inline">Turns:</span>
            <span className="font-semibold text-white">{turnsCount}</span>
          </div>

          <div
            className="flex items-center gap-1.5 pr-2 sm:pr-3 border-r border-slate-800"
            title="Average Fluency & Naturalness Score"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400 hidden md:inline">Fluency:</span>
            <span className={`font-semibold ${fluencyColorClass}`}>
              {averageFluency !== null ? `${averageFluency}%` : '--%'}
            </span>
          </div>

          <div
            className="flex items-center gap-1.5"
            title="Filler Words Detected (um, uh, like, basically, actually)"
          >
            <FilterX className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-slate-400 hidden md:inline">Fillers:</span>
            <span className="font-semibold text-rose-300">{fillersCount}</span>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Voice & Audio Settings"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden lg:inline">Voice Settings</span>
          </button>

          <button
            onClick={onOpenReport}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>Report Card</span>
          </button>
        </div>
      </div>
    </header>
  );
};
