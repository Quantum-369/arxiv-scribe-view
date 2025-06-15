
import { Search } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <Search className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">arXiv Scholar</h1>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
