
import { GoogleGenAI } from '@google/genai';
import { Paper } from "@/types/paper";
import { Message } from "@/types/chat";

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
    const ai = new GoogleGenAI({
      apiKey: geminiApiKey,
    });

    let systemPrompt = "";
    
    if (paper) {
      // Build comprehensive system prompt with all available paper information
      systemPrompt = `You are an expert research assistant helping users understand an academic paper. Here are the complete paper details:

PAPER METADATA:
Title: ${paper.title}
Authors: ${paper.authors.join(", ")}
Category: ${paper.category}
Published: ${paper.publishedDate}
Abstract: ${paper.abstract}`;

      // Add full text if available
      if (paper.fullText && paper.fullText.trim().length > 0) {
        systemPrompt += `

COMPLETE PAPER CONTENT:
${paper.fullText}

You have access to the ENTIRE paper content above. Use this complete text to provide detailed, accurate answers about:
- Specific methodologies and experimental procedures
- Detailed findings and results
- Data analysis and statistical methods
- Conclusions and implications
- Any specific sections, figures, tables, or equations mentioned
- Technical details and implementation specifics
- Related work and citations within the paper

When answering questions, reference specific parts of the paper content directly. You can quote exact passages when relevant.`;
      } else {
        systemPrompt += `

I have access to the paper metadata and abstract shown above. Based on this information, I can provide insights about the paper's general methodology, findings, implications, and context within the field. ${paper.textExtractionError ? `Note: Full text extraction failed (${paper.textExtractionError}), so my responses are based on the abstract and metadata only.` : 'I can help explain the research based on the available information.'}`;
      }

      systemPrompt += `

Keep responses informative but concise (under 500 words unless the user specifically asks for detailed explanations). Be accurate and cite specific parts of the paper when possible. If the user's question contains grammar mistakes or unclear phrasing, understand their intent and respond appropriately while maintaining professional communication.`;
    } else {
      systemPrompt = "You are an expert research assistant. Help users with questions about academic research, papers, methodologies, and scientific concepts. Keep responses concise and informative. If the user's question contains grammar mistakes or unclear phrasing, understand their intent and respond appropriately while maintaining professional communication.";
    }

    // Convert conversation history to Google's format
    const contents = [];
    
    // Add system prompt as first user message if we have paper context
    if (paper && systemPrompt) {
      contents.push({
        role: 'user',
        parts: [{ text: systemPrompt }]
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'I understand. I\'m ready to help you analyze this paper. What would you like to know?' }]
      });
    }

    // Add conversation history (skip the welcome message)
    const filteredHistory = conversationHistory.filter(msg => msg.id !== '1');
    for (const message of filteredHistory) {
      contents.push({
        role: message.type === 'user' ? 'user' : 'model',
        parts: [{ text: message.content }]
      });
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    console.log('Sending chat request with conversation history length:', contents.length);
    console.log('Paper content length:', paper?.fullText?.length || 0);

    const config = {
      responseMimeType: 'text/plain',
      maxOutputTokens: 4096,
      temperature: 0.7
    };

    const model = 'gemini-2.5-flash-preview-05-20';

    const response = await ai.models.generateContent({
      model,
      config,
      contents
    });

    if (response.text) {
      return response.text.trim();
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Error getting AI response:", error);
    return "Sorry, I encountered an error while processing your question. Please check your API key and try again.";
  }
};
