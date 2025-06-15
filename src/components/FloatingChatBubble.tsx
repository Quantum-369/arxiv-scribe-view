
import { useState } from "react";
import { MessageSquare, X, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatSidebar from "./ChatSidebar";
import { Paper } from "@/types/paper";

interface FloatingChatBubbleProps {
  paper?: Paper;
  geminiApiKey?: string;
}

const FloatingChatBubble = ({ paper, geminiApiKey }: FloatingChatBubbleProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (isOpen) {
    return (
      <div className="fixed inset-y-0 right-0 w-full lg:w-96 bg-white border-l border-slate-200 shadow-2xl z-50 lg:mx-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-academic-blue/5 to-academic-indigo/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-academic-blue/10">
              <MessageSquare className="h-4 w-4 text-academic-blue" />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-slate-900 text-sm">Chat with Paper</h3>
              <p className="text-xs text-slate-600">AI Research Assistant</p>
            </div>
            {!geminiApiKey && (
              <div className="p-1 rounded-full bg-amber-100">
                <AlertCircle className="h-3 w-3 text-amber-600" />
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="h-[calc(100vh-80px)]">
          <ChatSidebar paper={paper} geminiApiKey={geminiApiKey} />
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-br from-academic-blue to-academic-indigo hover:from-academic-indigo hover:to-academic-purple shadow-xl z-40 transition-all duration-300 hover:scale-105 group"
      size="icon"
    >
      <div className="relative">
        <MessageSquare className="h-6 w-6 text-white transition-transform group-hover:scale-110" />
        {geminiApiKey && (
          <div className="absolute -top-1 -right-1">
            <Sparkles className="h-3 w-3 text-white animate-pulse" />
          </div>
        )}
        {!geminiApiKey && (
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-amber-400 rounded-full border border-white" />
        )}
      </div>
    </Button>
  );
};

export default FloatingChatBubble;
