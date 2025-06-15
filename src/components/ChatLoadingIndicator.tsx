
import { Bot } from "lucide-react";

const ChatLoadingIndicator = () => {
  return (
    <div className="flex gap-3 justify-start">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-academic-blue to-academic-indigo flex items-center justify-center shadow-sm">
        <Bot className="h-4 w-4 text-white" />
      </div>
      
      <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-academic-blue/60 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-academic-blue/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-academic-blue/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-xs text-slate-500 ml-2">AI is thinking...</span>
        </div>
      </div>
    </div>
  );
};

export default ChatLoadingIndicator;
