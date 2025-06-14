
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-900">arXiv Scholar</h1>
          </div>
          <nav className="flex space-x-6">
            <Button variant="ghost" className="text-gray-700 hover:text-blue-900">
              Browse
            </Button>
            <Button variant="ghost" className="text-gray-700 hover:text-blue-900">
              Submit
            </Button>
            <Button variant="ghost" className="text-gray-700 hover:text-blue-900">
              Help
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
