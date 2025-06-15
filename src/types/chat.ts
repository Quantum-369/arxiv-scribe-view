
export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatSidebarProps {
  paper?: import('./paper').Paper;
  geminiApiKey?: string;
}
