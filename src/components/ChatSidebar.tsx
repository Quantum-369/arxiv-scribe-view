
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare, AlertCircle } from "lucide-react";
import { Message, ChatSidebarProps } from "@/types/chat";
import { getChatResponse } from "@/utils/geminiApi";
import ChatStatusIndicators from "./ChatStatusIndicators";
import ChatMessage from "./ChatMessage";
import ChatLoadingIndicator from "./ChatLoadingIndicator";

const ChatSidebar = ({ paper, geminiApiKey }: ChatSidebarProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: paper 
        ? `Hello! I'm here to help you understand "${paper.title}" by ${paper.authors.join(", ")}. ${
            !geminiApiKey 
              ? 'To enable AI-powered chat features, please add your Gemini API key in the search section above.' 
              : paper.fullText 
                ? 'I have access to the complete paper content and can answer detailed questions about the methodology, findings, analysis, and any specific sections.' 
                : 'I have access to the paper\'s metadata and abstract, and can help you understand the research.'
          } ${geminiApiKey ? `You can ask me about methodology, findings, implications, or anything else you'd like to know about this ${paper.category} paper published on ${paper.publishedDate}.` : ''}`
        : !geminiApiKey 
          ? "Hello! To start chatting about papers and research, please add your Gemini API key in the search section above."
          : "Hello! Select a paper to start chatting about it, or ask me general questions about research!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      const aiResponse = await getChatResponse(currentInput, paper, geminiApiKey);
      
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
            {!geminiApiKey && (
              <AlertCircle className="h-4 w-4 text-amber-500" />
            )}
          </div>
        </div>
      )}

      {/* API Key Warning */}
      {!geminiApiKey && (
        <div className="mx-4 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">API Key Required</p>
              <p className="text-xs text-amber-700 mt-1">
                Add your Gemini API key in the search section to enable AI chat features.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <ChatStatusIndicators paper={paper} />
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && <ChatLoadingIndicator />}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              !geminiApiKey 
                ? "Add API key to enable chat..." 
                : paper 
                  ? "Ask about this paper..." 
                  : "Ask me anything..."
            }
            className="flex-1 text-xs lg:text-sm"
            disabled={isLoading || !geminiApiKey}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim() || !geminiApiKey}
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
