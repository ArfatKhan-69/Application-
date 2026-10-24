import React, { useState } from 'react';
import { OrbState } from '../types';
import {
  Mic,
  Square,
  Loader2,
  Hand,
  RotateCcw,
  VolumeX,
  Lightbulb,
  Keyboard,
  Send,
} from 'lucide-react';

interface ControlsProps {
  orbState: OrbState;
  isSpeaking: boolean;
  onToggleMic: () => void;
  onInterruptOrReplay: () => void;
  onToggleHint: () => void;
  onSubmitText: (text: string) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  orbState,
  isSpeaking,
  onToggleMic,
  onInterruptOrReplay,
  onToggleHint,
  onSubmitText,
}) => {
  const [inputText, setInputText] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSubmitText(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className="z-10 flex flex-col gap-3 pt-2 border-t border-slate-800/80">
      {/* Primary Voice Controls Row */}
      <div className="flex items-center justify-center gap-3 sm:gap-5">
        {/* Need a Hint Button */}
        <button
          onClick={onToggleHint}
          className="px-3.5 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-amber-300 border border-slate-700/80 text-xs font-semibold transition flex items-center gap-1.5 shadow cursor-pointer"
          title="Stuck? Get a starter sentence idea"
        >
          <Lightbulb className="w-4 h-4" />
          <span className="hidden sm:inline">Idea / Hint</span>
        </button>

        {/* Main Microphone Button */}
        <button
          onClick={onToggleMic}
          className={`relative group flex items-center justify-center gap-2.5 px-7 py-4 rounded-full font-display font-bold text-sm sm:text-base transition-all transform active:scale-95 cursor-pointer shadow-xl ${
            orbState === 'listening'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/30 ring-4 ring-emerald-500/20'
              : orbState === 'thinking'
              ? 'bg-slate-800 border border-slate-700 text-slate-300 cursor-wait'
              : orbState === 'speaking'
              ? 'bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 text-white shadow-indigo-600/30'
              : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/30'
          }`}
        >
          {orbState === 'listening' ? (
            <>
              <Square className="w-5 h-5 fill-current animate-pulse" />
              <span>Done Speaking</span>
            </>
          ) : orbState === 'thinking' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-fuchsia-400" />
              <span>Thinking...</span>
            </>
          ) : orbState === 'speaking' ? (
            <>
              <Hand className="w-5 h-5" />
              <span>Interrupt & Speak</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span>Tap to Speak</span>
            </>
          )}
        </button>

        {/* Interrupt / Replay Nova Button */}
        <button
          onClick={onInterruptOrReplay}
          className="px-3.5 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-cyan-300 border border-slate-700/80 text-xs font-semibold transition flex items-center gap-1.5 shadow cursor-pointer"
          title={isSpeaking ? 'Stop Nova speaking' : "Replay Nova's voice"}
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">Stop Voice</span>
            </>
          ) : (
            <>
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Replay Voice</span>
            </>
          )}
        </button>
      </div>

      {/* Text Input Fallback & Quick Send */}
      <form
        onSubmit={handleFormSubmit}
        className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 focus-within:border-indigo-500/70 rounded-2xl px-3 py-1.5 transition"
      >
        <Keyboard className="w-4 h-4 text-slate-400 pl-0.5 shrink-0" />
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Or type your response here (press Enter to send)..."
          className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none py-1.5"
        />
        <button
          type="submit"
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <span>Send</span>
          <Send className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
};
