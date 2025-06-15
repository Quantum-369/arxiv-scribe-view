
import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
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
      <div className="fixed bottom-4 right-4 w-full max-w-sm lg:w-96 h-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 mx-4 lg:mx-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-900 text-sm">Chat with Paper</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="h-[calc(100%-60px)]">
          <ChatSidebar paper={paper} geminiApiKey={geminiApiKey} />
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-xl z-40 transition-all duration-200 hover:scale-105"
      size="icon"
    >
      <MessageSquare className="h-6 w-6 text-white" />
    </Button>
  );
};

export default FloatingChatBubble;
