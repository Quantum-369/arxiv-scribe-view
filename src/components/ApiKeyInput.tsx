
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Key } from "lucide-react";

interface ApiKeyInputProps {
  onApiKeyChange: (key: string) => void;
}

const ApiKeyInput = ({ onApiKeyChange }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem("gemini_api_key");
    if (storedKey) {
      setApiKey(storedKey);
      onApiKeyChange(storedKey);
    }
  }, [onApiKeyChange]);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("gemini_api_key", apiKey.trim());
      onApiKeyChange(apiKey.trim());
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem("gemini_api_key");
    setApiKey("");
    onApiKeyChange("");
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Key className="h-4 w-4 text-blue-600" />
        <Label className="text-blue-800 font-medium">Gemini API Key (Optional)</Label>
      </div>
      <p className="text-sm text-blue-700 mb-3">
        Add your Gemini API key for enhanced AI-powered search. Get one from{" "}
        <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">
          Google AI Studio
        </a>
      </p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type={showKey ? "text" : "password"}
            placeholder="Enter your Gemini API key..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="pr-10"
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
        <Button onClick={handleSaveKey} size="sm">
          Save
        </Button>
        {apiKey && (
          <Button onClick={handleClearKey} variant="outline" size="sm">
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

export default ApiKeyInput;
