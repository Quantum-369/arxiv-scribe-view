
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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
    <form onSubmit={handleSubmit} className="relative flex-1 max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Search papers, authors, abstracts..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 pr-4 py-3 w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <Button 
        type="submit" 
        className="absolute right-1 top-1 bottom-1 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
      >
        Search
      </Button>
    </form>
  );
};

export default SearchBar;
