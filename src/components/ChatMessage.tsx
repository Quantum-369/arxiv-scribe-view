
import { Message } from "@/types/chat";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.type === 'user';
  
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-academic-blue to-academic-indigo flex items-center justify-center shadow-sm">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
      
      <div className={`max-w-[85%] lg:max-w-[75%] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isUser
              ? 'bg-gradient-to-br from-academic-blue to-academic-indigo text-white'
              : 'bg-white border border-slate-200 text-slate-900'
          }`}
        >
          <div className={`text-sm leading-relaxed whitespace-pre-wrap ${
            isUser ? 'text-white' : 'text-slate-800'
          }`}>
            {/* Simple markdown-like formatting for assistant messages */}
            {!isUser ? (
              <div 
                dangerouslySetInnerHTML={{
                  __html: message.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                    .replace(/```(.*?)```/gs, '<code class="bg-slate-100 px-2 py-1 rounded text-xs font-mono">$1</code>')
                    .replace(/`(.*?)`/g, '<code class="bg-slate-100 px-1 rounded text-xs font-mono">$1</code>')
                    .replace(/\n/g, '<br>')
                }}
              />
            ) : (
              message.content
            )}
          </div>
        </div>
        
        <div className={`text-xs mt-2 ${
          isUser ? 'text-right text-slate-500' : 'text-left text-slate-500'
        }`}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-sm">
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
