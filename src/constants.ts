import { ScenarioConfig, ScenarioKey } from './types';

export const SCENARIO_MODES: Record<ScenarioKey, ScenarioConfig> = {
  free_talk: {
    key: 'free_talk',
    name: 'Free Talk',
    iconName: 'Coffee',
    systemContext:
      'Casual, friendly phone call about everyday life, hobbies, movies, technology, career, or personal goals.',
    starterGreeting:
      "Hey there! I'm Nova, your personal English speaking partner. Tap the microphone below and tell me—how is your day going so far?",
    starterHint:
      "My day has been pretty good so far! I spent the morning catching up on my work, and now I'm excited to practice my English.",
  },
  job_interview: {
    key: 'job_interview',
    name: 'Job Interview Coach',
    iconName: 'Briefcase',
    systemContext:
      'Friendly but professional hiring manager conducting a mock job interview. Ask realistic behavioral, career, and situational questions. Help the user articulate their achievements with impact.',
    starterGreeting:
      "Welcome! Let's practice for your upcoming job interview. To kick things off, could you tell me a little bit about yourself and what role you're aiming for?",
    starterHint:
      "Sure! I'm a developer with a passion for building user-focused applications, and I'm currently looking for an impactful full-stack role.",
  },
  situational: {
    key: 'situational',
    name: 'Everyday Roleplay',
    iconName: 'Plane',
    systemContext:
      'Everyday real-world English roleplay situations such as networking at an international mixer, ordering at a specialty cafe, checking in at a hotel, or workplace project discussions.',
    starterGreeting:
      "Let's do a quick real-world roleplay! Imagine we just bumped into each other at an international tech & creator networking mixer. What brings you to the event today?",
    starterHint:
      "Hi! It's great to meet you. I came here today to connect with fellow creators and learn more about recent innovations in AI.",
  },
  debate: {
    key: 'debate',
    name: 'Debate & Opinion',
    iconName: 'Scale',
    systemContext:
      'Intellectual yet encouraging debate partner helping the user structure persuasive arguments, express clear opinions, and use smooth transition words in spoken English.',
    starterGreeting:
      "Let's sharpen your persuasive English! Here's a fun topic: Do you think remote work is better than working from an office, or does in-person collaboration still win? What's your take?",
    starterHint:
      'In my opinion, a hybrid model works best because remote work offers deep focus, while office days help strengthen team relationships.',
  },
  custom: {
    key: 'custom',
    name: 'Custom Topic',
    iconName: 'Sparkles',
    systemContext: 'Custom user-selected scenario and topic.',
    starterGreeting:
      "I'm ready! Type your custom scenario above or just start speaking about whatever is on your mind right now.",
    starterHint:
      "I'd love to practice talking about my favorite podcast and what lessons I learned from it.",
  },
};

export const FILLER_WORDS_LIST = [
  'um',
  'uh',
  'er',
  'ah',
  'like',
  'basically',
  'actually',
  'literally',
  'you know',
  'sort of',
  'kind of',
  'honestly',
];
