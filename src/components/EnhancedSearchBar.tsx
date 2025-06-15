
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EnhancedSearchBarProps {
  onSearch: (query: string) => void;
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
  hasAI?: boolean;
}

const EnhancedSearchBar = ({ onSearch, value, onChange, isLoading, hasAI }: EnhancedSearchBarProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value);
  };

  const suggestions = [
    "machine learning transformers",
    "quantum computing algorithms", 
    "climate change modeling",
    "neural networks optimization"
  ];

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-academic-blue transition-colors duration-200" />
          <Input
            type="text"
            placeholder="Search papers, authors, abstracts... Try natural language!"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-12 pr-4 sm:pr-32 py-4 text-base border-gray-200 rounded-xl focus:ring-2 focus:ring-academic-blue focus:border-transparent shadow-sm w-full bg-white hover:shadow-md transition-all duration-200"
            disabled={isLoading}
          />
          
          {hasAI && (
            <div className="absolute right-20 sm:right-32 top-1/2 transform -translate-y-1/2">
              <Badge variant="secondary" className="bg-gradient-to-r from-academic-blue to-academic-indigo text-white border-0 text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                AI
              </Badge>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 sm:px-6 py-2 bg-academic-blue hover:bg-academic-blue/90 text-white rounded-lg text-sm font-medium hidden sm:block transition-colors duration-200"
            disabled={isLoading}
          >
            {isLoading ? "Searching..." : "Search"}
          </Button>
          <Button 
            type="submit" 
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-academic-blue hover:bg-academic-blue/90 text-white rounded-lg sm:hidden transition-colors duration-200"
            disabled={isLoading}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </form>
      
      {!value && (
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="text-sm text-gray-500 mr-2">Try:</span>
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onChange(suggestion)}
              className="text-xs bg-gray-50 hover:bg-academic-blue hover:text-white transition-colors duration-200"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchBar;
