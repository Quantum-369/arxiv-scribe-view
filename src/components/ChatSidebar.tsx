
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare, AlertCircle, Sparkles } from "lucide-react";
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
        ? `Welcome! I'm your AI research assistant, ready to help you understand **"${paper.title}"** by ${paper.authors.join(", ")}. ${
            !geminiApiKey 
              ? '\n\n🔑 **API Key Required**: Please add your Gemini API key in the search section to unlock AI-powered analysis.' 
              : paper.fullText 
                ? '\n\n✨ **Full Access**: I have the complete paper content and can answer detailed questions about methodology, findings, analysis, and specific sections.' 
                : '\n\n📄 **Metadata Access**: I can help you understand the research based on the abstract and paper details.'
          } ${geminiApiKey ? `\n\n💡 **What would you like to explore?**\n• Methodology and approach\n• Key findings and results\n• Implications and significance\n• Technical details\n• Related research` : ''}`.trim()
        : !geminiApiKey 
          ? "👋 **Welcome to arXiv Scholar Chat!**\n\nI'm your AI research assistant. To start our conversation:\n\n🔑 Add your Gemini API key in the search section\n📄 Select a paper to analyze\n💬 Ask me anything about research!"
          : "👋 **Hello! I'm your AI research assistant.**\n\nSelect a paper to start our deep-dive analysis, or ask me general questions about research, methodologies, and academic concepts!",
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
        content: "I apologize, but I encountered an error processing your request. Please check your API key and try again, or rephrase your question.",
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
    <div className="flex flex-col h-full bg-gradient-to-b from-white to-slate-50">
      {/* Header - enhanced with gradient and better typography */}
      {!paper && (
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-academic-blue/5 to-academic-indigo/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-academic-blue/10">
              <MessageSquare className="h-5 w-5 text-academic-blue" />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-slate-900 text-lg">Research Assistant</h3>
              <p className="text-sm text-slate-600">AI-powered paper analysis</p>
            </div>
            {!geminiApiKey && (
              <div className="ml-auto">
                <div className="p-1.5 rounded-full bg-amber-100">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* API Key Warning - redesigned */}
      {!geminiApiKey && (
        <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-full bg-amber-100 mt-0.5">
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">API Key Required</p>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                Add your Gemini API key in the search section to unlock AI-powered research assistance and paper analysis.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages - enhanced scroll area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          <ChatStatusIndicators paper={paper} />
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && <ChatLoadingIndicator />}
        </div>
      </ScrollArea>

      {/* Input - redesigned with better visual hierarchy */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                !geminiApiKey 
                  ? "Add API key to start chatting..." 
                  : paper 
                    ? "Ask about methodology, findings, implications..." 
                    : "Ask me about research, papers, or methodology..."
              }
              className="flex-1 text-sm border-slate-300 focus:border-academic-blue focus:ring-academic-blue/20 placeholder:text-slate-500 pr-10"
              disabled={isLoading || !geminiApiKey}
            />
            {geminiApiKey && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Sparkles className="h-4 w-4 text-slate-400" />
              </div>
            )}
          </div>
          <Button 
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim() || !geminiApiKey}
            size="sm"
            className="bg-academic-blue hover:bg-academic-indigo text-white shadow-md hover:shadow-lg transition-all duration-200 px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {geminiApiKey && (
          <p className="text-xs text-slate-500 mt-2 text-center">
            Press Enter to send • Shift+Enter for new line
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
