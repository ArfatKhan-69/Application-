import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client safely with server API key
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Conversational English Coach Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check your environment configuration.',
      });
    }

    const { messages, userMessage, scenarioDescription } = req.body;

    if (!userMessage || typeof userMessage !== 'string') {
      return res.status(400).json({ error: 'userMessage is required.' });
    }

    const systemInstruction = `You are Nova, an engaging, friendly, and realistic Spoken English Partner and Fluency Coach.
Practice Scenario: ${scenarioDescription || 'Casual, friendly everyday conversation'}

YOUR CRITICAL GUIDELINES:
1. Spoken Reply (spokenReply):
   - Sound like a real native friend or supportive coach on a live voice call.
   - Keep it concise: 2 to 3 sentences maximum so the conversation moves fast and feels like a real voice call.
   - Be encouraging, conversational, and NEVER use bullet points or markdown syntax in spokenReply.
   - ALWAYS end your spokenReply with an open-ended question to prompt the user to speak next.
2. Grammar & Native Phrasing Evaluation:
   - hasMistake: boolean (true if user made a grammar mistake, unnatural phrasing, or if there is a noticeably smoother native way to say it).
   - originalText: exact sentence or phrase spoken by the user that was evaluated.
   - correctedText: a natural, idiomatic, polished version of how a native English speaker would say the same idea.
   - explanation: a concise, encouraging 1-sentence tip explaining why this phrasing works better or correcting the grammar rule.
   - vocabUpgrade: 1-2 advanced words, phrasal verbs, or idioms relevant to the topic with short definitions.
   - fluencyScore: integer from 1 to 100 rating fluency, clarity, and grammatical naturalness.
   - suggestedReplyHint: a starter sentence (1 sentence) the user could say next in response to your follow-up question.`;

    const chatContents = Array.isArray(messages) && messages.length > 0
      ? [...messages, { role: 'user', parts: [{ text: userMessage }] }]
      : [{ role: 'user', parts: [{ text: userMessage }] }];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: chatContents,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            spokenReply: {
              type: Type.STRING,
              description: 'The short conversational voice reply (2-3 sentences max) ending in a question.',
            },
            hasMistake: {
              type: Type.BOOLEAN,
              description: 'Whether there was a grammar or unnatural phrasing issue.',
            },
            originalText: {
              type: Type.STRING,
              description: 'The user text evaluated.',
            },
            correctedText: {
              type: Type.STRING,
              description: 'The improved native phrasing.',
            },
            explanation: {
              type: Type.STRING,
              description: 'One sentence coaching explanation.',
            },
            vocabUpgrade: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  wordOrIdiom: { type: Type.STRING },
                  meaning: { type: Type.STRING },
                },
                required: ['wordOrIdiom', 'meaning'],
              },
            },
            fluencyScore: {
              type: Type.INTEGER,
              description: 'Fluency score from 1 to 100.',
            },
            suggestedReplyHint: {
              type: Type.STRING,
              description: 'A recommended sentence starter for the user next turn.',
            },
          },
          required: [
            'spokenReply',
            'hasMistake',
            'originalText',
            'correctedText',
            'explanation',
            'vocabUpgrade',
            'fluencyScore',
            'suggestedReplyHint',
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from model');
    }

    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate response from coach.',
    });
  }
});

// High-Fidelity Text-to-Speech Endpoint via Gemini TTS
app.post('/api/tts', async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const { text, voiceName = 'Kore' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text is required.' });
    }

    // Call Gemini 3.8 Flash Lite TTS
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text,
              speechMetadata: {
                style: 'Warm, natural, clear conversational English partner',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName || 'Kore',
            },
          },
        },
      },
    });

    const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioBase64) {
      throw new Error('No audio returned from Gemini TTS.');
    }

    return res.json({
      audioBase64,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.warn('Gemini TTS endpoint warning:', error.message);
    return res.status(500).json({
      error: error.message || 'TTS generation failed.',
    });
  }
});

// Vite Dev Middleware or Static Production Serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`NovaSpeak AI server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
