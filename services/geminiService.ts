
import { GoogleGenAI, Modality } from "@google/genai";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

// Audio Helpers
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// FIX: Simplified client instance helper
// Helper to get client instance
const getClient = (apiKey: string) => {
  return new GoogleGenAI({ apiKey });
};

export const generateContent = async (
  prompt: string, 
  systemInstruction: string = "You are a helpful and knowledgeable Madrasa teacher.",
  apiKey?: string,
  jsonMode: boolean = false
): Promise<string> => {
  // FIX: Centralized API key check
  if (!apiKey) {
    throw new Error("Пожалуйста, введите API ключ в настройках.");
  }
  const key = apiKey;

  // Handle DeepSeek API
  if (key.startsWith("sk-")) {
    try {
      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
          ],
          stream: false,
          response_format: jsonMode ? { type: "json_object" } : undefined
        })
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`DeepSeek API Error: ${response.status} ${err}`);
      }
      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (error) {
      console.error("DeepSeek Service Error:", error);
      throw error;
    }
  }

  // Handle Google Gemini API
  try {
    const ai = getClient(key);
    // FIX: Correctly form the config object, only including responseMimeType when needed.
    const config: {
        systemInstruction: string;
        responseMimeType?: "application/json";
    } = {
      systemInstruction: systemInstruction,
    };
    if (jsonMode) {
      config.responseMimeType = "application/json";
    }
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      // FIX: Use simple string for text content as per guidelines
      contents: prompt,
      config: config
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};

export const generateStudyPlan = async (apiKey?: string, contentStats?: string): Promise<string[]> => {
    const prompt = `Составь строгий план обучения в медресе ровно на 3 месяца.
    Используй ТОЛЬКО следующие данные о доступном материале в приложении:
    ${contentStats || "Азкары, Суры, Дуа, Фикх, Таджвид"}
    
    Задача: Рассчитай нагрузку так, чтобы студент успел выучить ВЕСЬ этот объем ровно за 3 месяца.
    В ответе укажи конкретные цифры: сколько карточек/азкаров/вопросов нужно учить в день или в неделю по каждому разделу.
    Верни результат строго как JSON массив строк (Array<string>), где каждая строка - это пункт плана с цифрами.
    Не используй блоки markdown. Пример ответа: ["Учить по 1 утреннему азкару в день", "Проходить 3 вопроса по Фикху в неделю"].`;

    try {
        const response = await generateContent(prompt, "Ты строгий, но справедливый учитель медресе, который любит точность и цифры.", apiKey, true);
        const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();
        let parsed = JSON.parse(cleaned);
        // Handle cases where AI wraps array in an object
        if (!Array.isArray(parsed) && parsed.plan) {
            parsed = parsed.plan;
        } else if (!Array.isArray(parsed) && parsed.tasks) {
            parsed = parsed.tasks;
        }
        return Array.isArray(parsed) ? parsed : ["Ошибка формата ответа ИИ"];
    } catch (e) {
        console.error("Failed to parse plan", e);
        return [
            "Учить по 1 утреннему и вечернему азкару каждые 2 дня", 
            "Проходить 3 вопроса по Фикху в неделю", 
            "Учить 1 новую суру раз в 2 недели", 
            "Повторять правила таджвида по выходным"
        ];
    }
};

export const explainText = async (text: string, apiKey?: string): Promise<string> => {
    const prompt = `Explain the meaning and wisdom of this Islamic text briefly: "${text}"`;
    return await generateContent(prompt, "You are a knowledgeable Islamic scholar. Keep explanations simple and inspiring.", apiKey);
};

export const chatWithMentor = async (message: string, apiKey?: string): Promise<string> => {
    return await generateContent(message, "You are a friendly Madrasa mentor. Answer Islamic questions with wisdom and kindness.", apiKey);
};

export const generateDua = async (topic: string, apiKey?: string): Promise<any> => {
    const prompt = `Create a Dua for: "${topic}". Return strictly valid JSON with keys: "ar" (Arabic text), "tr" (Transliteration), "ru" (Russian translation). Do not use markdown blocks.`;
    try {
        const text = await generateContent(prompt, "You are an expert in Duas.", apiKey, true);
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        throw new Error("Failed to parse Dua JSON");
    }
};

export const speakText = async (text: string, ctx: AudioContext, apiKey?: string): Promise<AudioBuffer> => {
  // FIX: Centralized API key check
  if (!apiKey) {
    throw new Error("Пожалуйста, введите API ключ в настройках.");
  }
  const key = apiKey;

  // Fallback for DeepSeek Key: Use Web Speech API
  if (key.startsWith("sk-")) {
    return new Promise((resolve) => {
        // Cancel any pending speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        // Try to set to Arabic if supported, otherwise browser default
        utterance.lang = "ar-SA"; 
        utterance.rate = 0.9;
        
        // Return a silent buffer to satisfy the AudioContext flow in the UI
        // The browser will handle the actual audio output.
        // Creating a 1-second silent buffer.
        const silentBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
        
        // Speak using browser API
        window.speechSynthesis.speak(utterance);
        
        resolve(silentBuffer);
    });
  }

  // Google Gemini TTS Logic
  try {
    const ai = getClient(key);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Puck' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio data received from Gemini");
    }

    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      ctx,
      24000,
      1
    );
    
    return audioBuffer;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    throw error;
  }
};
