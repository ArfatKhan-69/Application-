import React, { useState } from 'react';
import { CoachingData } from '../types';
import { Award, X, Copy, Check, Sparkles, MessageSquare, Mic } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  turnsCount: number;
  totalWords: number;
  totalFillers: number;
  fillerBreakdown: Record<string, number>;
  averageFluency: number | null;
  scenarioName: string;
  corrections: Array<CoachingData & { id: string }>;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  turnsCount,
  totalWords,
  totalFillers,
  fillerBreakdown,
  averageFluency,
  scenarioName,
  corrections,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const lines = [
      '=== NovaSpeak AI Spoken English Report Card ===',
      `Practice Mode: ${scenarioName}`,
      `Speaking Turns: ${turnsCount} | Words Spoken: ${totalWords}`,
      `Average Fluency Score: ${averageFluency !== null ? `${averageFluency}%` : 'N/A'} | Filler Words: ${totalFillers}`,
      '',
      'Key Phrasing Refinements:',
    ];

    if (corrections.length === 0) {
      lines.push('No grammar errors detected. Natural conversational flow!');
    } else {
      corrections.forEach((c, idx) => {
        lines.push(`${idx + 1}. Instead of: "${c.originalText}" -> Say: "${c.correctedText}" (${c.explanation})`);
      });
    }

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const fillerPairs = Object.entries(fillerBreakdown)
    .filter(([_, count]) => count > 0)
    .map(([word, count]) => `"${word}" (${count}x)`)
    .join(', ');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="glass-panel rounded-3xl max-w-2xl w-full p-5 sm:p-7 border border-slate-700/80 shadow-2xl my-8 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg sm:text-xl text-white">
                Spoken English Session Report Card
              </h2>
              <p className="text-xs text-slate-400">
                Mode: <span className="text-indigo-300 font-semibold">{scenarioName}</span> • Live Fluency & Habit Breakdown
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Summary Stat Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="glass-card rounded-2xl p-3.5 text-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
              Overall Fluency
            </span>
            <span
              className={`font-display font-extrabold text-2xl sm:text-3xl mt-1 block ${
                averageFluency === null
                  ? 'text-slate-400'
                  : averageFluency >= 80
                  ? 'text-emerald-400'
                  : averageFluency >= 65
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {averageFluency !== null ? `${averageFluency}%` : '--%'}
            </span>
          </div>

          <div className="glass-card rounded-2xl p-3.5 text-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
              Words Spoken
            </span>
            <span className="font-display font-extrabold text-2xl sm:text-3xl text-indigo-300 mt-1 block">
              {totalWords}
            </span>
          </div>

          <div className="glass-card rounded-2xl p-3.5 text-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
              Speaking Turns
            </span>
            <span className="font-display font-extrabold text-2xl sm:text-3xl text-cyan-300 mt-1 block">
              {turnsCount}
            </span>
          </div>

          <div className="glass-card rounded-2xl p-3.5 text-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
              Filler Words
            </span>
            <span className="font-display font-extrabold text-2xl sm:text-3xl text-rose-400 mt-1 block">
              {totalFillers}
            </span>
          </div>
        </div>

        {/* Filler Words Breakdown */}
        <div className="glass-card rounded-2xl p-4 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Mic className="w-4 h-4 text-indigo-400" />
            Communication Clarity & Filler Habit Check
          </h3>
          <div className="text-xs text-slate-300 leading-relaxed">
            {turnsCount === 0 ? (
              <p>Complete a few speaking turns with Nova to unlock your filler word & pacing insights.</p>
            ) : totalFillers === 0 ? (
              <p>
                <span className="text-emerald-400 font-semibold">Spotless delivery!</span> You spoke{' '}
                <strong className="text-white">{totalWords} words</strong> across{' '}
                <strong className="text-white">{turnsCount} turns</strong> without relying on filler words like "um", "uh", or "basically".
              </p>
            ) : (
              <p>
                We detected <span className="text-rose-300 font-semibold">{totalFillers} filler word(s)</span> during your session:{' '}
                <span className="text-white font-mono bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                  {fillerPairs}
                </span>
                . <br />
                <span className="text-indigo-300 font-medium">Coach's tip:</span> Try pausing silently for a split second instead of vocalizing a filler word. Native executive speakers use quiet pauses to build confidence and give listeners time to absorb key points.
              </p>
            )}
          </div>
        </div>

        {/* Key Grammar & Phrasing Upgrades */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Key Phrasing Refinements From This Call
          </h3>
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {corrections.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                No grammar corrections recorded in this session yet. Keep talking with Nova!
              </p>
            ) : (
              corrections.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs space-y-1"
                >
                  <p className="text-rose-300 line-through">"{c.originalText}"</p>
                  <p className="text-emerald-300 font-semibold flex items-center gap-1.5">
                    <span>→</span>
                    <span>"{c.correctedText}"</span>
                  </p>
                  <p className="text-[11px] text-slate-400">{c.explanation}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-2 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-indigo-400" />
                <span>Copy Summary Report</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer"
          >
            Back to Live Call
          </button>
        </div>
      </div>
    </div>
  );
};
