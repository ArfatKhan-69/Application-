import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  OrbState,
  ScenarioKey,
  Message,
  CoachingData,
  SavedPhrase,
  VoiceSettings,
} from './types';
import { SCENARIO_MODES, FILLER_WORDS_LIST } from './constants';
import { Header } from './components/Header';
import { ScenarioBar } from './components/ScenarioBar';
import { VoiceOrb } from './components/VoiceOrb';
import { Controls } from './components/Controls';
import { Sidebar } from './components/Sidebar';
import { ReportModal } from './components/ReportModal';
import { SettingsModal } from './components/SettingsModal';
import { Toast } from './components/Toast';

export default function App() {
  // Scenario & UI State
  const [currentMode, setCurrentMode] = useState<ScenarioKey>('free_talk');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [handsFreeMode, setHandsFreeMode] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'transcript' | 'corrections' | 'saved'>('transcript');

  // Orb & Voice State
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [subtitle, setSubtitle] = useState<string>(SCENARIO_MODES.free_talk.starterGreeting);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [hintText, setHintText] = useState<string>(SCENARIO_MODES.free_talk.starterHint);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Modals & Feedback
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Analytics & Metrics
  const [sessionStartTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [turnsCount, setTurnsCount] = useState<number>(0);
  const [totalWords, setTotalWords] = useState<number>(0);
  const [totalFillers, setTotalFillers] = useState<number>(0);
  const [fillerBreakdown, setFillerBreakdown] = useState<Record<string, number>>({});
  const [fluencyScores, setFluencyScores] = useState<number[]>([]);

  // Messages & Phrases
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_init',
      sender: 'nova',
      text: SCENARIO_MODES.free_talk.starterGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [corrections, setCorrections] = useState<Array<CoachingData & { id: string; timestamp: string }>>([]);
  const [savedDeck, setSavedDeck] = useState<SavedPhrase[]>(() => {
    try {
      const stored = localStorage.getItem('novaspeak_saved_deck_v2');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Voice Settings & Web Speech Synthesis
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    ttsEngine: 'browser',
    browserVoiceURI: '',
    geminiVoice: 'Kore',
    speechRate: 1.0,
    autoSpeak: true,
  });

  // Refs for audio, speech recognition, and active state
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const handsFreeRef = useRef<boolean>(handsFreeMode);
  const isProcessingRef = useRef<boolean>(false);
  const lastNovaTextRef = useRef<string>(SCENARIO_MODES.free_talk.starterGreeting);
  const chatHistoryRef = useRef<Array<{ role: string; parts: Array<{ text: string }> }>>([
    { role: 'model', parts: [{ text: SCENARIO_MODES.free_talk.starterGreeting }] },
  ]);

  useEffect(() => {
    handsFreeRef.current = handsFreeMode;
  }, [handsFreeMode]);

  // Session Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionStartTime]);

  // Toast Helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Populate Speech Synthesis Voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
        const englishVoices = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
        const preferred =
          englishVoices.find((v) =>
            /Google US English|Microsoft Aria|Microsoft Jenny|Samantha|Victoria|Karen|Natural/i.test(
              v.name
            )
          ) || englishVoices[0] || voices[0];

        setVoiceSettings((prev) => ({
          ...prev,
          browserVoiceURI: prev.browserVoiceURI || preferred?.voiceURI || '',
        }));
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Stop all active audio / TTS
  const stopAllAudio = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setIsSpeaking(false);
    if (!isListeningRef.current && !isProcessingRef.current) {
      setOrbState('idle');
    }
  }, []);

  // Speak via Browser TTS
  const speakWithBrowser = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!('speechSynthesis' in window)) {
        onEnd?.();
        return;
      }
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = voiceSettings.speechRate;
      utterance.pitch = 1.02;

      const chosen = availableVoices.find((v) => v.voiceURI === voiceSettings.browserVoiceURI);
      if (chosen) utterance.voice = chosen;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setOrbState('speaking');
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setOrbState('idle');
        onEnd?.();
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setOrbState('idle');
        onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    },
    [availableVoices, voiceSettings.browserVoiceURI, voiceSettings.speechRate]
  );

  // Speak via Gemini TTS (with fallback to browser)
  const speakWithGemini = useCallback(
    async (text: string, onEnd?: () => void) => {
      try {
        setIsSpeaking(true);
        setOrbState('speaking');

        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voiceName: voiceSettings.geminiVoice || 'Kore',
          }),
        });

        if (!response.ok) {
          throw new Error('Gemini TTS failed');
        }

        const data = await response.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
          currentAudioRef.current = audio;
          audio.playbackRate = voiceSettings.speechRate;

          audio.onended = () => {
            setIsSpeaking(false);
            setOrbState('idle');
            currentAudioRef.current = null;
            onEnd?.();
          };

          audio.onerror = () => {
            setIsSpeaking(false);
            setOrbState('idle');
            currentAudioRef.current = null;
            onEnd?.();
          };

          await audio.play();
          return;
        }
      } catch (err) {
        console.warn('Gemini TTS error, falling back to browser TTS:', err);
      }

      speakWithBrowser(text, onEnd);
    },
    [voiceSettings.geminiVoice, voiceSettings.speechRate, speakWithBrowser]
  );

  // Master speak dispatcher
  const speakText = useCallback(
    (text: string, enableContinuousListen = true) => {
      lastNovaTextRef.current = text;

      if (!voiceSettings.autoSpeak) {
        setOrbState('idle');
        return;
      }

      const handleSpeechFinished = () => {
        if (
          enableContinuousListen &&
          handsFreeRef.current &&
          !isListeningRef.current &&
          !isProcessingRef.current
        ) {
          setTimeout(() => {
            if (!isListeningRef.current && !isProcessingRef.current) {
              startListening();
            }
          }, 400);
        }
      };

      if (voiceSettings.ttsEngine === 'gemini') {
        speakWithGemini(text, handleSpeechFinished);
      } else {
        speakWithBrowser(text, handleSpeechFinished);
      }
    },
    [voiceSettings.autoSpeak, voiceSettings.ttsEngine, speakWithGemini, speakWithBrowser]
  );

  // Analyze Filler Words in User Speech
  const analyzeFillers = useCallback((text: string) => {
    const cleanWords = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = cleanWords.length;
    setTotalWords((prev) => prev + wordCount);

    const lower = text.toLowerCase();
    let turnFillers = 0;
    const newBreakdown: Record<string, number> = {};

    FILLER_WORDS_LIST.forEach((filler) => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = lower.match(regex);
      if (matches && matches.length > 0) {
        turnFillers += matches.length;
        newBreakdown[filler] = matches.length;
      }
    });

    if (turnFillers > 0) {
      setTotalFillers((prev) => prev + turnFillers);
      setFillerBreakdown((prev) => {
        const merged = { ...prev };
        Object.entries(newBreakdown).forEach(([k, v]) => {
          merged[k] = (merged[k] || 0) + v;
        });
        return merged;
      });
    }

    return turnFillers;
  }, []);

  // Process User Turn with Backend Gemini API
  const handleUserTurn = useCallback(
    async (userInput: string) => {
      const trimmed = userInput.trim();
      if (!trimmed || isProcessingRef.current) return;

      stopAllAudio();
      isProcessingRef.current = true;
      setOrbState('thinking');

      setTurnsCount((prev) => prev + 1);
      const fillersInTurn = analyzeFillers(trimmed);

      const userMsgId = 'msg_' + Date.now();
      const userMsg: Message = {
        id: userMsgId,
        sender: 'user',
        text: trimmed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fillersInTurn,
        coaching: null,
      };

      setMessages((prev) => [...prev, userMsg]);

      const modeInfo = SCENARIO_MODES[currentMode] || SCENARIO_MODES.free_talk;
      const scenarioDescription =
        currentMode === 'custom' && customTopic
          ? `Custom Topic requested by user: "${customTopic}"`
          : modeInfo.systemContext;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: chatHistoryRef.current,
            userMessage: trimmed,
            scenarioDescription,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server returned HTTP ${response.status}`);
        }

        const data = await response.json();

        // Update history
        chatHistoryRef.current.push(
          { role: 'user', parts: [{ text: trimmed }] },
          { role: 'model', parts: [{ text: data.spokenReply }] }
        );

        const coachingData: CoachingData = {
          hasMistake: Boolean(data.hasMistake),
          originalText: data.originalText || trimmed,
          correctedText: data.correctedText || trimmed,
          explanation: data.explanation || 'Great job practicing your conversational English!',
          vocabUpgrade: data.vocabUpgrade || [],
          fluencyScore: Number(data.fluencyScore) || 85,
        };

        // Attach coaching to user message
        setMessages((prev) =>
          prev.map((m) => (m.id === userMsgId ? { ...m, coaching: coachingData } : m))
        );

        setFluencyScores((prev) => [...prev, coachingData.fluencyScore]);

        if (coachingData.hasMistake || coachingData.vocabUpgrade.length > 0) {
          setCorrections((prev) => [
            {
              id: 'corr_' + Date.now(),
              ...coachingData,
              timestamp: userMsg.timestamp,
            },
            ...prev,
          ]);
        }

        const reply = data.spokenReply || "That's very interesting! Could you tell me more about that?";
        const nextHint =
          data.suggestedReplyHint ||
          "I'd love to tell you more about my thoughts on this!";

        setSubtitle(reply);
        setHintText(nextHint);

        const novaMsg: Message = {
          id: 'msg_nova_' + Date.now(),
          sender: 'nova',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, novaMsg]);
        isProcessingRef.current = false;
        speakText(reply, true);
      } catch (err) {
        console.error('Error during AI coaching call:', err);
        isProcessingRef.current = false;

        const fallback =
          "I hear you loud and clear! Could you tell me a little bit more about that?";
        setSubtitle(fallback);

        setMessages((prev) => [
          ...prev,
          {
            id: 'msg_nova_' + Date.now(),
            sender: 'nova',
            text: fallback,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);

        speakText(fallback, true);
      }
    },
    [analyzeFillers, currentMode, customTopic, speakText, stopAllAudio]
  );

  // Initialize Web Speech Recognition
  const startListening = useCallback(() => {
    if (isProcessingRef.current) return;
    stopAllAudio();

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      showToast('Voice recognition is not supported in this browser. Please use the text input below!');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      let accumulated = '';

      rec.onstart = () => {
        isListeningRef.current = true;
        setOrbState('listening');
        setInterimTranscript('');
      };

      rec.onresult = (event: any) => {
        let interim = '';
        let finalChunk = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const piece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += piece + ' ';
          } else {
            interim += piece;
          }
        }

        if (finalChunk) {
          accumulated += finalChunk;
        }

        const preview = (accumulated + ' ' + interim).trim();
        setInterimTranscript(preview);
      };

      rec.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          showToast('Microphone permission denied. You can also type in the text box!');
        }
        isListeningRef.current = false;
        setInterimTranscript('');
        if (!isProcessingRef.current) {
          setOrbState('idle');
        }
      };

      rec.onend = () => {
        const wasListening = isListeningRef.current;
        isListeningRef.current = false;
        setInterimTranscript('');

        const finalSpoken = accumulated.trim();
        if (wasListening && finalSpoken.length > 0) {
          handleUserTurn(finalSpoken);
        } else if (!isProcessingRef.current) {
          setOrbState('idle');
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      console.warn('Speech recognition error:', e);
      isListeningRef.current = false;
      setOrbState('idle');
    }
  }, [handleUserTurn, showToast, stopAllAudio]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  // Primary Action Button (Mic Toggle)
  const handlePrimaryMicAction = useCallback(() => {
    if (isSpeaking) {
      stopAllAudio();
      startListening();
      return;
    }
    if (isListeningRef.current) {
      stopListening();
    } else {
      startListening();
    }
  }, [isSpeaking, startListening, stopAllAudio, stopListening]);

  // Interrupt or Replay
  const handleInterruptOrReplay = useCallback(() => {
    if (isSpeaking) {
      stopAllAudio();
    } else if (lastNovaTextRef.current) {
      speakText(lastNovaTextRef.current, false);
    }
  }, [isSpeaking, speakText, stopAllAudio]);

  // Scenario Selection
  const handleSelectScenario = useCallback(
    (mode: ScenarioKey) => {
      stopAllAudio();
      if (isListeningRef.current) stopListening();

      setCurrentMode(mode);
      const config = SCENARIO_MODES[mode] || SCENARIO_MODES.free_talk;

      const greeting =
        mode === 'custom' && customTopic
          ? `Awesome! Let's roleplay or discuss "${customTopic}". What would you like to focus on?`
          : config.starterGreeting;

      setSubtitle(greeting);
      setHintText(config.starterHint);
      lastNovaTextRef.current = greeting;

      chatHistoryRef.current = [{ role: 'model', parts: [{ text: greeting }] }];
      setMessages([
        {
          id: 'msg_init_' + Date.now(),
          sender: 'nova',
          text: greeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      speakText(greeting, false);
    },
    [customTopic, speakText, stopAllAudio, stopListening]
  );

  const handleApplyCustomTopic = useCallback(
    (topic: string) => {
      setCustomTopic(topic);
      const greeting = `Awesome! Let's talk about "${topic}". How would you like to start, or what's your take on this?`;
      setSubtitle(greeting);
      setHintText(`I'm excited to practice talking about ${topic}!`);
      lastNovaTextRef.current = greeting;

      chatHistoryRef.current = [{ role: 'model', parts: [{ text: greeting }] }];
      setMessages([
        {
          id: 'msg_custom_' + Date.now(),
          sender: 'nova',
          text: greeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      showToast(`Topic updated: "${topic}"`);
      speakText(greeting, false);
    },
    [showToast, speakText]
  );

  // Deck Management
  const handleSaveToDeck = useCallback(
    (original: string, better: string, tip: string) => {
      const exists = savedDeck.some((card) => card.better === better);
      if (exists) {
        showToast('Already saved in your Phrase Deck!');
        return;
      }

      const newCard: SavedPhrase = {
        id: 'phrase_' + Date.now(),
        original,
        better,
        tip,
        savedAt: Date.now(),
      };

      const updated = [newCard, ...savedDeck];
      setSavedDeck(updated);
      try {
        localStorage.setItem('novaspeak_saved_deck_v2', JSON.stringify(updated));
      } catch {}

      showToast('Saved to your Phrase Deck!');
    },
    [savedDeck, showToast]
  );

  const handleRemoveSavedCard = useCallback(
    (id: string) => {
      const updated = savedDeck.filter((c) => c.id !== id);
      setSavedDeck(updated);
      try {
        localStorage.setItem('novaspeak_saved_deck_v2', JSON.stringify(updated));
      } catch {}
      showToast('Card removed from deck');
    },
    [savedDeck, showToast]
  );

  // Reset Session
  const handleResetSession = useCallback(() => {
    stopAllAudio();
    if (isListeningRef.current) stopListening();

    setTurnsCount(0);
    setTotalWords(0);
    setTotalFillers(0);
    setFillerBreakdown({});
    setFluencyScores([]);
    setCorrections([]);

    const config = SCENARIO_MODES[currentMode] || SCENARIO_MODES.free_talk;
    const greeting = config.starterGreeting;
    setSubtitle(greeting);
    setHintText(config.starterHint);
    lastNovaTextRef.current = greeting;

    chatHistoryRef.current = [{ role: 'model', parts: [{ text: greeting }] }];
    setMessages([
      {
        id: 'msg_init_' + Date.now(),
        sender: 'nova',
        text: greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    showToast('Conversation session reset!');
  }, [currentMode, stopAllAudio, stopListening, showToast]);

  // Average Fluency Calculation
  const averageFluency =
    fluencyScores.length > 0
      ? Math.round(fluencyScores.reduce((a, b) => a + b, 0) / fluencyScores.length)
      : null;

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Header with live fluency telemetry bar */}
      <Header
        elapsedSeconds={elapsedSeconds}
        turnsCount={turnsCount}
        averageFluency={averageFluency}
        fillersCount={totalFillers}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
      />

      {/* Main Workspace Grid */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 p-3 sm:p-5 overflow-hidden">
        {/* LEFT COLUMN: Practice Mode Selector, Animated Voice Orb, Controls */}
        <section className="lg:col-span-7 flex flex-col justify-between glass-panel rounded-3xl p-4 sm:p-6 relative overflow-hidden min-h-[580px] shadow-xl">
          <ScenarioBar
            currentMode={currentMode}
            handsFreeMode={handsFreeMode}
            customTopic={customTopic}
            onSelectMode={handleSelectScenario}
            onToggleHandsFree={(val) => {
              setHandsFreeMode(val);
              showToast(val ? 'Continuous Call Mode ON' : 'Continuous Call Mode OFF (Push-to-Talk)');
            }}
            onApplyCustomTopic={handleApplyCustomTopic}
          />

          <VoiceOrb
            orbState={orbState}
            subtitle={subtitle}
            interimTranscript={interimTranscript}
            hintText={hintText}
            showHint={showHint}
            onCloseHint={() => setShowHint(false)}
            onOrbClick={handlePrimaryMicAction}
          />

          <Controls
            orbState={orbState}
            isSpeaking={isSpeaking}
            onToggleMic={handlePrimaryMicAction}
            onInterruptOrReplay={handleInterruptOrReplay}
            onToggleHint={() => setShowHint((prev) => !prev)}
            onSubmitText={handleUserTurn}
          />
        </section>

        {/* RIGHT COLUMN: Live Transcript & Inline Coaching Cards, Corrections, Saved Deck */}
        <Sidebar
          activeTab={activeTab}
          messages={messages}
          corrections={corrections}
          savedDeck={savedDeck}
          onTabChange={setActiveTab}
          onResetSession={handleResetSession}
          onSpeakSnippet={(snippet) => speakText(snippet, false)}
          onSaveToDeck={handleSaveToDeck}
          onRemoveSavedCard={handleRemoveSavedCard}
        />
      </main>

      {/* Modals & Toast */}
      <ReportModal
        isOpen={isReportOpen}
        turnsCount={turnsCount}
        totalWords={totalWords}
        totalFillers={totalFillers}
        fillerBreakdown={fillerBreakdown}
        averageFluency={averageFluency}
        scenarioName={SCENARIO_MODES[currentMode]?.name || 'Custom'}
        corrections={corrections}
        onClose={() => setIsReportOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        settings={voiceSettings}
        availableVoices={availableVoices}
        onUpdateSettings={(newSettings) =>
          setVoiceSettings((prev) => ({ ...prev, ...newSettings }))
        }
        onTestVoice={() =>
          speakText(
            "Hi there! I'm Nova, your personal English speaking coach. Let's practice together!",
            false
          )
        }
        onClose={() => {
          setIsSettingsOpen(false);
          showToast('Voice settings saved!');
        }}
      />

      <Toast message={toastMessage} />
    </div>
  );
}
