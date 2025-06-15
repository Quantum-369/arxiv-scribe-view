
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch: (query: string) => void;
  value: string;
  onChange: (value: string) => void;
}

const SearchBar = ({ onSearch, value, onChange }: SearchBarProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Search papers, authors, abstracts..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-12 pr-4 sm:pr-24 py-3 text-base border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm w-full"
        />
        <Button 
          type="submit" 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium hidden sm:block"
        >
          Search
        </Button>
        <Button 
          type="submit" 
          size="icon"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg sm:hidden"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;
