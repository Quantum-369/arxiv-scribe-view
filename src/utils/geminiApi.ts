import { Paper } from "@/types/paper";

export const getChatResponse = async (
  userMessage: string, 
  paper?: Paper, 
  geminiApiKey?: string
): Promise<string> => {
  if (!geminiApiKey) {
    return "Please add your Gemini API key in the search section above to enable AI chat functionality.";
  }

  try {
    const modelUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent";
    
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

    const prompt = `${systemPrompt}\n\nUser question: ${userMessage}`;

    console.log('Sending chat request with paper content length:', paper?.fullText?.length || 0);

    const body = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "text/plain",
        maxOutputTokens: 1000,
        temperature: 0.7
      }
    };

    const response = await fetch(modelUrl + `?key=${geminiApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error("Failed to get AI response");
    }

    const result = await response.json();
    
    if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
      return result.candidates[0].content.parts[0].text.trim();
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Error getting AI response:", error);
    return "Sorry, I encountered an error while processing your question. Please check your API key and try again.";
  }
};
