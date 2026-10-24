import React, { useState } from 'react';
import { ScenarioKey } from '../types';
import { SCENARIO_MODES } from '../constants';
import {
  Coffee,
  Briefcase,
  Plane,
  Scale,
  Sparkles,
  PhoneCall,
  Send,
} from 'lucide-react';

interface ScenarioBarProps {
  currentMode: ScenarioKey;
  handsFreeMode: boolean;
  customTopic: string;
  onSelectMode: (mode: ScenarioKey) => void;
  onToggleHandsFree: (enabled: boolean) => void;
  onApplyCustomTopic: (topic: string) => void;
}

export const ScenarioBar: React.FC<ScenarioBarProps> = ({
  currentMode,
  handsFreeMode,
  customTopic,
  onSelectMode,
  onToggleHandsFree,
  onApplyCustomTopic,
}) => {
  const [topicInput, setTopicInput] = useState(customTopic || '');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Briefcase':
        return <Briefcase className="w-3.5 h-3.5" />;
      case 'Plane':
        return <Plane className="w-3.5 h-3.5" />;
      case 'Scale':
        return <Scale className="w-3.5 h-3.5" />;
      case 'Sparkles':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'Coffee':
      default:
        return <Coffee className="w-3.5 h-3.5" />;
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topicInput.trim()) {
      onApplyCustomTopic(topicInput.trim());
    }
  };

  return (
    <div className="z-10 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Practice Mode:
          </span>
        </div>

        {/* Continuous Hands-Free Call Mode Toggle */}
        <label className="flex items-center gap-2.5 cursor-pointer bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-full hover:border-indigo-500/60 transition">
          <input
            type="checkbox"
            checked={handsFreeMode}
            onChange={(e) => onToggleHandsFree(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all relative peer-checked:bg-emerald-500" />
          <span className="text-xs font-medium text-slate-200 flex items-center gap-1.5 select-none">
            <PhoneCall className="w-3 h-3 text-emerald-400" />
            Continuous Call Mode
          </span>
        </label>
      </div>

      {/* Mode Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {Object.values(SCENARIO_MODES).map((mode) => {
          const isActive = currentMode === mode.key;
          return (
            <button
              key={mode.key}
              onClick={() => onSelectMode(mode.key)}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/70'
              }`}
            >
              {getIcon(mode.iconName)}
              <span>{mode.name}</span>
            </button>
          );
        })}
      </div>

      {/* Custom Topic Input Bar (Visible when custom mode selected) */}
      {currentMode === 'custom' && (
        <form
          onSubmit={handleCustomSubmit}
          className="flex items-center gap-2 bg-slate-900/90 p-2 rounded-xl border border-indigo-500/40 animate-in fade-in slide-in-from-top-1"
        >
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="E.g., Pitching my startup idea, discussing recent movies, travel check-in..."
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none px-2"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3 h-3" />
            <span>Start Topic</span>
          </button>
        </form>
      )}
    </div>
  );
};
