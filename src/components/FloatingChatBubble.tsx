
import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatSidebar from "./ChatSidebar";

interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  category: string;
  publishedDate: string;
  pdfUrl: string;
  citations?: number;
}

interface FloatingChatBubbleProps {
  paper?: Paper;
  geminiApiKey?: string;
}

const FloatingChatBubble = ({ paper, geminiApiKey }: FloatingChatBubbleProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (isOpen) {
    return (
      <div className="fixed bottom-4 right-4 w-full max-w-sm lg:w-96 h-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 mx-4 lg:mx-0">
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 text-sm lg:text-base">Chat with Paper</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
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
      className="fixed bottom-6 right-6 h-12 w-12 lg:h-14 lg:w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg z-40"
      size="icon"
    >
      <MessageSquare className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
    </Button>
  );
};

export default FloatingChatBubble;
