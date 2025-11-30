import { GoogleGenAI, Type } from "@google/genai";
import { INITIAL_MESSAGES } from "../constants";

let aiClient: GoogleGenAI | null = null;

// Initialize client lazily to avoid immediate env check failures if not needed immediately
const getClient = () => {
  if (!aiClient && process.env.API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiClient;
};

export const fetchHeartwarmingMessages = async (): Promise<string[]> => {
  const client = getClient();
  if (!client) {
    console.warn("API Key not found, using fallback messages.");
    // Return a shuffled subset of initial messages to simulate freshness
    return [...INITIAL_MESSAGES].sort(() => 0.5 - Math.random()).slice(0, 5);
  }

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate 10 short, heartwarming, comforting, and encouraging sentences in Chinese for someone who might be tired, stressed, or lonely. Keep them concise (under 15 characters).",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            messages: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of comforting messages"
            }
          },
          required: ["messages"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    const parsed = JSON.parse(jsonText);
    if (parsed && Array.isArray(parsed.messages)) {
      return parsed.messages;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch messages from Gemini:", error);
    return [];
  }
};