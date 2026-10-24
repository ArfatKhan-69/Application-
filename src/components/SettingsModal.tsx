import React from 'react';
import { VoiceSettings } from '../types';
import { Sliders, X, Volume2, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  settings: VoiceSettings;
  availableVoices: SpeechSynthesisVoice[];
  onUpdateSettings: (newSettings: Partial<VoiceSettings>) => void;
  onTestVoice: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  availableVoices,
  onUpdateSettings,
  onTestVoice,
  onClose,
}) => {
  if (!isOpen) return null;

  const englishVoices = availableVoices.filter(
    (v) => v.lang && v.lang.toLowerCase().startsWith('en')
  );
  const voicesToDisplay = englishVoices.length > 0 ? englishVoices : availableVoices;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="glass-panel rounded-3xl max-w-md w-full p-6 border border-slate-700/80 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Sliders className="w-4 h-4" />
            </div>
            <h2 className="font-display font-bold text-lg text-white">
              Nova Voice & Call Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          {/* Voice Engine Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Voice Synthesis Engine
            </label>
            <select
              value={settings.ttsEngine}
              onChange={(e) =>
                onUpdateSettings({ ttsEngine: e.target.value as 'browser' | 'gemini' })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="browser">Instant Browser Neural Voice (Zero Latency)</option>
              <option value="gemini">Gemini 3.8 Native Neural Voice (Kore HD Studio)</option>
            </select>
          </div>

          {/* Browser Voice Selection */}
          {settings.ttsEngine === 'browser' ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Browser English Voice
              </label>
              <select
                value={settings.browserVoiceURI}
                onChange={(e) => onUpdateSettings({ browserVoiceURI: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {voicesToDisplay.length === 0 ? (
                  <option value="">Default System Voice</option>
                ) : (
                  voicesToDisplay.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))
                )}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Gemini Neural Voice Persona
              </label>
              <select
                value={settings.geminiVoice}
                onChange={(e) => onUpdateSettings({ geminiVoice: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Kore">Kore (Warm, Friendly Female Coach)</option>
                <option value="Zephyr">Zephyr (Bright, Engaging Female Partner)</option>
                <option value="Puck">Puck (Energetic, Natural Male Partner)</option>
                <option value="Fenrir">Fenrir (Calm, Articulate Male Executive)</option>
                <option value="Charon">Charon (Deep, Grounded Professional)</option>
              </select>
            </div>
          )}

          {/* Speaking Speed */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold uppercase tracking-wider text-slate-400">
                Speaking Speed
              </span>
              <span className="font-mono font-bold text-indigo-400">
                {settings.speechRate.toFixed(2)}x ({settings.speechRate === 1 ? 'Natural' : settings.speechRate < 1 ? 'Slower' : 'Faster'})
              </span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.25"
              step="0.05"
              value={settings.speechRate}
              onChange={(e) => onUpdateSettings({ speechRate: parseFloat(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-0.5">
              <span>0.75x (Slower)</span>
              <span>1.0x (Normal)</span>
              <span>1.25x (Faster)</span>
            </div>
          </div>

          {/* Auto-Speak Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div>
              <p className="font-semibold text-slate-200">Auto-Speak Nova's Replies</p>
              <p className="text-xs text-slate-400">Automatically speak Nova's message aloud</p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoSpeak}
              onChange={(e) => onUpdateSettings({ autoSpeak: e.target.checked })}
              className="w-5 h-5 accent-indigo-500 rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onTestVoice}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Test Voice</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
