export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking';

export type ScenarioKey = 'free_talk' | 'job_interview' | 'situational' | 'debate' | 'custom';

export interface VocabUpgrade {
  wordOrIdiom: string;
  meaning: string;
}

export interface CoachingData {
  hasMistake: boolean;
  originalText: string;
  correctedText: string;
  explanation: string;
  vocabUpgrade: VocabUpgrade[];
  fluencyScore: number;
}

export interface Message {
  id: string;
  sender: 'nova' | 'user';
  text: string;
  timestamp: string;
  coaching?: CoachingData | null;
  fillersInTurn?: number;
}

export interface SavedPhrase {
  id: string;
  original: string;
  better: string;
  tip: string;
  savedAt: number;
}

export interface ScenarioConfig {
  key: ScenarioKey;
  name: string;
  iconName: string;
  systemContext: string;
  starterGreeting: string;
  starterHint: string;
}

export interface VoiceSettings {
  ttsEngine: 'browser' | 'gemini';
  browserVoiceURI: string;
  geminiVoice: string;
  speechRate: number;
  autoSpeak: boolean;
}
