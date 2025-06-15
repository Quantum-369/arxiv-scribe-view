import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Key, ChevronDown, ChevronUp, Settings } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ApiKeyInputProps {
  onApiKeyChange: (key: string) => void;
}

const ApiKeyInput = ({ onApiKeyChange }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const storedKey = localStorage.getItem("gemini_api_key");
    if (storedKey) {
      setApiKey(storedKey);
      onApiKeyChange(storedKey);
      setIsExpanded(false); // Collapse if key is already present
    }
  }, [onApiKeyChange]);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("gemini_api_key", apiKey.trim());
      onApiKeyChange(apiKey.trim());
      setIsExpanded(false); // Collapse after saving
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem("gemini_api_key");
    setApiKey("");
    onApiKeyChange("");
    setIsExpanded(true); // Expand when cleared
  };

  // If API key exists, show compact version
  if (apiKey && !isExpanded) {
    return (
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between p-0 h-auto hover:bg-green-100"
            >
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-green-600" />
                <span className="text-green-800 font-medium text-sm">
                  AI-Enhanced Search Enabled
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-green-600" />
                <ChevronDown className="h-4 w-4 text-green-600" />
              </div>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 lg:p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Key className="h-4 w-4 text-blue-600" />
              <Label className="text-blue-800 font-medium text-sm lg:text-base">Gemini API Key (Optional)</Label>
            </div>
            <p className="text-xs lg:text-sm text-blue-700 mb-3">
              Add your Gemini API key for enhanced AI-powered search and chat. Get one from{" "}
              <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">
                Google AI Studio
              </a>
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Input
                  type={showKey ? "text" : "password"}
                  placeholder="Enter your Gemini API key..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pr-10 text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveKey} size="sm" className="flex-1 sm:flex-none">
                  Save
                </Button>
                {apiKey && (
                  <Button onClick={handleClearKey} variant="outline" size="sm" className="flex-1 sm:flex-none">
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 lg:p-4 mb-4">
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-2 mb-2 cursor-pointer">
            <Key className="h-4 w-4 text-blue-600" />
            <Label className="text-blue-800 font-medium text-sm lg:text-base flex-1">
              Gemini API Key (Optional)
            </Label>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-blue-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-blue-600" />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <p className="text-xs lg:text-sm text-blue-700 mb-3">
            Add your Gemini API key for enhanced AI-powered search and chat. Get one from{" "}
            <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">
              Google AI Studio
            </a>
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Input
                type={showKey ? "text" : "password"}
                placeholder="Enter your Gemini API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10 text-sm"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveKey} size="sm" className="flex-1 sm:flex-none">
                Save
              </Button>
              {apiKey && (
                <Button onClick={handleClearKey} variant="outline" size="sm" className="flex-1 sm:flex-none">
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default ApiKeyInput;
