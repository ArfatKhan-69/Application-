import React, { useRef, useEffect } from 'react';
import { Message, SavedPhrase, CoachingData } from '../types';
import {
  Activity,
  Wand2,
  Bookmark,
  Volume2,
  Trash2,
  RotateCw,
  Lightbulb,
  CheckCircle,
  GraduationCap,
  Info,
  CheckCheck,
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'transcript' | 'corrections' | 'saved';
  messages: Message[];
  corrections: Array<CoachingData & { id: string; timestamp: string }>;
  savedDeck: SavedPhrase[];
  onTabChange: (tab: 'transcript' | 'corrections' | 'saved') => void;
  onResetSession: () => void;
  onSpeakSnippet: (text: string) => void;
  onSaveToDeck: (original: string, better: string, tip: string) => void;
  onRemoveSavedCard: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  messages,
  corrections,
  savedDeck,
  onTabChange,
  onResetSession,
  onSpeakSnippet,
  onSaveToDeck,
  onRemoveSavedCard,
}) => {
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeTab === 'transcript') {
      transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  return (
    <aside className="lg:col-span-5 flex flex-col glass-panel rounded-3xl overflow-hidden h-[620px] lg:h-[calc(100vh-92px)] shadow-xl">
      {/* Sidebar Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800/90 bg-slate-900/60 px-3 pt-2.5">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => onTabChange('transcript')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'transcript'
                ? 'border-indigo-500 text-white bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Live Call & Coach</span>
          </button>

          <button
            onClick={() => onTabChange('corrections')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'corrections'
                ? 'border-indigo-500 text-white bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Corrections</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {corrections.length}
            </span>
          </button>

          <button
            onClick={() => onTabChange('saved')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'saved'
                ? 'border-indigo-500 text-white bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span>Saved Deck</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {savedDeck.length}
            </span>
          </button>
        </div>

        <button
          onClick={onResetSession}
          className="text-[11px] text-slate-400 hover:text-rose-400 px-2 py-1 rounded transition flex items-center gap-1 cursor-pointer shrink-0"
          title="Reset current conversation"
        >
          <RotateCw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* TAB 1: LIVE TRANSCRIPT & INLINE GRAMMAR COACH CARDS */}
      {activeTab === 'transcript' && (
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
          {messages.map((msg) => {
            if (msg.sender === 'nova') {
              return (
                <div key={msg.id} className="flex items-start gap-2.5 animate-in fade-in">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white shrink-0 shadow-md mt-0.5">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="flex-1 bg-slate-900/85 border border-slate-800 rounded-2xl rounded-tl-sm p-3.5 shadow">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                        Nova • AI Coach
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSpeakSnippet(msg.text)}
                          className="text-slate-400 hover:text-cyan-300 text-xs transition cursor-pointer p-0.5"
                          title="Listen again"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-100 leading-relaxed">
                      {msg.text}
                    </p>
                  </div>
                </div>
              );
            }

            // User turn with speech bubble + inline coaching card
            const coaching = msg.coaching;
            return (
              <div key={msg.id} className="flex flex-col items-end space-y-2 animate-in fade-in">
                <div className="max-w-[92%] bg-indigo-600/25 border border-indigo-500/40 rounded-2xl rounded-tr-sm p-3.5 text-right shadow">
                  <div className="flex items-center justify-end gap-2 mb-1">
                    {coaching ? (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          coaching.fluencyScore >= 80
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : coaching.fluencyScore >= 65
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        Fluency {coaching.fluencyScore}%
                      </span>
                    ) : (
                      <span className="text-[10px] text-fuchsia-300 animate-pulse flex items-center gap-1">
                        Analyzing English...
                      </span>
                    )}
                    <span className="text-[11px] font-bold text-indigo-200">You</span>
                    <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-white leading-relaxed text-left">
                    {msg.text}
                  </p>
                </div>

                {/* Inline Coaching Card */}
                {coaching && (
                  <div
                    className={`w-full sm:w-[94%] bg-slate-900/95 border ${
                      coaching.hasMistake
                        ? 'border-emerald-500/35'
                        : 'border-indigo-500/30'
                    } rounded-2xl p-3 text-xs space-y-2 shadow-lg`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-bold uppercase tracking-wider text-[10px] ${
                          coaching.hasMistake ? 'text-emerald-400' : 'text-indigo-300'
                        } flex items-center gap-1.5`}
                      >
                        {coaching.hasMistake ? (
                          <>
                            <Wand2 className="w-3.5 h-3.5" />
                            Better Native Phrasing
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            Great Natural Expression!
                          </>
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSpeakSnippet(coaching.correctedText)}
                          className="text-slate-400 hover:text-cyan-300 transition cursor-pointer p-0.5"
                          title="Hear native pronunciation"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            onSaveToDeck(
                              coaching.originalText,
                              coaching.correctedText,
                              coaching.explanation
                            )
                          }
                          className="text-amber-400 hover:text-amber-300 transition cursor-pointer p-0.5"
                          title="Save improved phrase to Deck"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-emerald-950/35 border border-emerald-500/25 rounded-xl px-3 py-2 text-emerald-200 font-medium leading-relaxed">
                      "{coaching.correctedText}"
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed flex items-start gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{coaching.explanation}</span>
                    </p>

                    {coaching.vocabUpgrade && coaching.vocabUpgrade.length > 0 && (
                      <div className="pt-1 border-t border-slate-800/80">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                          Vocabulary Boost:
                        </span>
                        <div className="space-y-1.5">
                          {coaching.vocabUpgrade.map((v, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between gap-2 bg-slate-900/90 border border-slate-800/90 rounded-xl px-2.5 py-1.5"
                            >
                              <div className="text-[11px]">
                                <span className="font-bold text-cyan-300">
                                  {v.wordOrIdiom}
                                </span>
                                <span className="text-slate-400"> — {v.meaning}</span>
                              </div>
                              <button
                                onClick={() =>
                                  onSaveToDeck('Vocab Upgrade', v.wordOrIdiom, v.meaning)
                                }
                                className="text-amber-400 hover:text-amber-300 text-xs px-1 cursor-pointer"
                                title="Save to Phrase Deck"
                              >
                                <Bookmark className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={transcriptEndRef} />
        </div>
      )}

      {/* TAB 2: DEDICATED GRAMMAR & VOCABULARY CORRECTIONS FEED */}
      {activeTab === 'corrections' && (
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {corrections.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                <CheckCheck className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-200">
                No Grammar Corrections Yet
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                Start speaking with Nova! Every time she spots a way to make your English sound more natural or native, a detailed coaching card will appear here.
              </p>
            </div>
          ) : (
            corrections.map((item) => (
              <div
                key={item.id}
                className="glass-card rounded-2xl p-3.5 space-y-2 border border-slate-700/80 shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Fluency Score: {item.fluencyScore}%
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSpeakSnippet(item.correctedText)}
                      className="text-xs text-slate-300 hover:text-cyan-300 cursor-pointer p-0.5"
                      title="Hear pronunciation"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        onSaveToDeck(item.originalText, item.correctedText, item.explanation)
                      }
                      className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Bookmark className="w-3 h-3" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <p className="text-rose-300/90 line-through">
                    <span className="text-slate-400 no-underline mr-1">You said:</span>"
                    {item.originalText}"
                  </p>
                  <p className="text-emerald-300 font-semibold">
                    <span className="text-slate-400 font-normal mr-1">Better way:</span>"
                    {item.correctedText}"
                  </p>
                </div>

                <p className="text-[11px] text-slate-300 bg-slate-900/80 rounded-xl p-2 border border-slate-800 flex items-start gap-1.5 leading-relaxed">
                  <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{item.explanation}</span>
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: SAVED PHRASES & VOCABULARY FLASHCARD DECK */}
      {activeTab === 'saved' && (
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {savedDeck.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
                <Bookmark className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-200">
                Your Phrase Deck is Empty
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                Bookmark any improved sentence or vocabulary upgrade during your conversation to build your personal revision deck.
              </p>
            </div>
          ) : (
            savedDeck.map((card) => (
              <div
                key={card.id}
                className="glass-card rounded-2xl p-3.5 space-y-2 border border-amber-500/25 shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Bookmark className="w-3 h-3 fill-current" />
                    Saved Expression
                  </span>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => onSpeakSnippet(card.better)}
                      className="text-xs text-cyan-300 hover:text-cyan-200 cursor-pointer p-0.5"
                      title="Listen"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onRemoveSavedCard(card.id)}
                      className="text-xs text-slate-400 hover:text-rose-400 cursor-pointer p-0.5"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-bold text-white">"{card.better}"</p>

                {card.original && card.original !== 'Vocab Upgrade' && (
                  <p className="text-[11px] text-slate-400">
                    Instead of: <span className="italic">"{card.original}"</span>
                  </p>
                )}

                <p className="text-[11px] text-indigo-200 bg-slate-900/80 rounded-xl p-2 border border-slate-800 leading-relaxed">
                  {card.tip}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </aside>
  );
};
