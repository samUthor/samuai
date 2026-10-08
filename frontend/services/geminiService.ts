import { GoogleGenAI } from '@google/genai';
import { SYSTEM_INSTRUCTION } from '../constants';
import { ChatMessage } from '../types';

export async function requestAgentResponse(
  conversationHistory: ChatMessage[],
  latestUserInput: string
): Promise<string> {
  const ai = new GoogleGenAI({
    apiKey: process.env.API_KEY,
    vertexai: true
  });

  // Build sequential contents history for context
  const parts = conversationHistory.slice(-8).map((msg) => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  // Append latest turn
  parts.push({
    role: 'user',
    parts: [{ text: latestUserInput }]
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: parts,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        maxOutputTokens: 350
      }
    });

    const reply = response.text?.trim() || "I'm right here! Could you please repeat that? I'd love to help with your order or return.";
    return reply;
  } catch (error) {
    console.error('Error generating Gemini response:', error);
    throw error;
  }
}
