import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare } from "lucide-react";
import { Paper } from "@/types/paper";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSidebarProps {
  paper?: Paper;
  geminiApiKey?: string;
}

const ChatSidebar = ({ paper, geminiApiKey }: ChatSidebarProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: paper 
        ? `Hello! I'm here to help you understand "${paper.title}" by ${paper.authors.join(", ")}. ${paper.fullText ? 'I have access to the complete paper content and can answer detailed questions about the methodology, findings, analysis, and any specific sections.' : 'I have access to the paper\'s metadata and abstract, and can help you understand the research.'} You can ask me about methodology, findings, implications, or anything else you'd like to know about this ${paper.category} paper published on ${paper.publishedDate}.`
        : "Hello! Select a paper to start chatting about it, or ask me general questions about research!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getChatResponse = async (userMessage: string): Promise<string> => {
    if (!geminiApiKey) {
      return "Please add your Gemini API key in the search section above to enable AI chat functionality.";
    }

    try {
      const modelUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
      
      const systemPrompt = paper 
        ? `You are an expert research assistant helping users understand an academic paper. Here are the paper details:

Title: ${paper.title}
Authors: ${paper.authors.join(", ")}
Category: ${paper.category}
Published: ${paper.publishedDate}
Abstract: ${paper.abstract}

${paper.fullText ? `COMPLETE PAPER CONTENT:
${paper.fullText}

Based on this complete paper content, provide detailed, accurate insights about the paper's methodology, findings, analysis, results, conclusions, and any specific sections the user asks about. You have access to the entire paper text, so you can answer questions about specific details, equations, figures, experimental procedures, results, and conclusions.` : 'I have access to the paper metadata and abstract. Based on this information, provide helpful insights about the paper\'s methodology, findings, implications, and context within the field. If users ask about specific details not available in the metadata, acknowledge the limitation and provide insights based on what is available.'}

Keep responses informative but concise (under 500 words). If the user asks about specific sections, figures, or equations, reference them directly from the paper content.`
        : "You are an expert research assistant. Help users with questions about academic research, papers, methodologies, and scientific concepts. Keep responses concise and informative.";

      const prompt = `${systemPrompt}\n\nUser question: ${userMessage}`;

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

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponse = await getChatResponse(currentInput);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header - only show in full sidebar mode */}
      {!paper && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Research Assistant</h3>
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {paper?.textExtractionError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                Note: Could not extract full paper text ({paper.textExtractionError}). 
                Chat responses will be based on the abstract and metadata only.
              </p>
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] lg:max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-xs lg:text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={paper ? "Ask about this paper..." : "Ask me anything..."}
            className="flex-1 text-xs lg:text-sm"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-3 w-3 lg:h-4 lg:w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
