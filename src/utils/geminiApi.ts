
import { GoogleGenAI } from '@google/genai';
import { Paper } from "@/types/paper";
import { Message } from "@/types/chat";
import { buildSystemPrompt } from './geminiPromptBuilder';
import { formatChatHistory } from './geminiChatHistory';

export const getChatResponse = async (
  userMessage: string,
  conversationHistory: Message[],
  paper?: Paper, 
  geminiApiKey?: string
): Promise<string> => {
  if (!geminiApiKey) {
    return "Please add your Gemini API key in the search section above to enable AI chat functionality.";
  }

  try {
    const ai = new GoogleGenAI(geminiApiKey);
    const systemPrompt = buildSystemPrompt(paper);
    const contents = formatChatHistory(conversationHistory, systemPrompt, userMessage, paper);

    console.log('Sending chat request with conversation history length:', contents.length);
    console.log('Paper content length:', paper?.fullText?.length || 0);

    const config = {
      responseMimeType: 'text/plain',
      maxOutputTokens: 4096,
      temperature: 0.7
    };

    const model = ai.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: config
    });

    const response = await model.generateContent({ contents });

    if (response.response?.text) {
      return response.response.text().trim();
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Error getting AI response:", error);
    return "Sorry, I encountered an error while processing your question. Please check your API key and try again.";
  }
};

export const getChatResponseStream = async (
  userMessage: string,
  conversationHistory: Message[],
  paper: Paper | undefined,
  geminiApiKey: string,
  onChunk: (chunk: string) => void
): Promise<void> => {
  if (!geminiApiKey) {
    onChunk("Please add your Gemini API key in the search section above to enable AI chat functionality.");
    return;
  }

  try {
    const ai = new GoogleGenAI(geminiApiKey);
    const systemPrompt = buildSystemPrompt(paper);
    const contents = formatChatHistory(conversationHistory, systemPrompt, userMessage, paper);

    console.log('Sending streaming chat request with conversation history length:', contents.length);
    console.log('Paper content length:', paper?.fullText?.length || 0);

    const config = {
      responseMimeType: 'text/plain',
      maxOutputTokens: 4096,
      temperature: 0.7
    };

    const model = ai.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: config
    });

    const response = await model.generateContentStream({ contents });

    for await (const chunk of response.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        console.log('Received chunk:', chunkText.length, 'characters');
        onChunk(chunkText);
      }
    }
  } catch (error) {
    console.error("Error getting streaming AI response:", error);
    onChunk("Sorry, I encountered an error while processing your question. Please check your API key and try again.");
  }
};
