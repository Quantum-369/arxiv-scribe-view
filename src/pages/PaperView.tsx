
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Paper } from "@/types/paper";
import { extractPdfText } from "@/utils/simplePdfExtractor";
import PdfCanvasViewer from "@/components/PdfCanvasViewer";
import FloatingChatBubble from "@/components/FloatingChatBubble";

const PaperView = () => {
  const navigate = useNavigate();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [isAbstractOpen, setIsAbstractOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get paper data from sessionStorage
    const paperData = sessionStorage.getItem('currentPaper');
    const apiKey = sessionStorage.getItem('geminiApiKey');
    
    if (paperData) {
      const parsedPaper = JSON.parse(paperData) as Paper;
      setPaper(parsedPaper);
      setGeminiApiKey(apiKey || "");
      setIsLoading(false);
      
      // Start PDF text extraction
      if (parsedPaper.pdfUrl) {
        extractPdfText(parsedPaper.pdfUrl).then(({ text, error }) => {
          setPaper(prev => prev ? {
            ...prev,
            fullText: text || undefined,
            textExtractionError: error
          } : null);
        });
      }
    } else {
      // No paper data, redirect back to search
      navigate('/');
    }
  }, [navigate]);

  const handleDownload = () => {
    if (!paper) return;
    const link = document.createElement('a');
    link.href = paper.pdfUrl;
    link.download = `${paper.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    if (!paper) return;
    window.open(paper.pdfUrl, '_blank', 'noopener,noreferrer');
  };

  const handleBack = () => {
    navigate('/');
  };

  if (isLoading || !paper) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading paper...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Search
              </Button>
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="text-xs font-medium">
                  {paper.category}
                </Badge>
                <span className="text-sm text-gray-500">{paper.publishedDate}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Paper Title and Authors */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
            {paper.title}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {paper.authors.join(", ")}
          </p>
          
          {/* Collapsible Abstract */}
          <Collapsible open={isAbstractOpen} onOpenChange={setIsAbstractOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between p-4 h-auto bg-gray-50 hover:bg-gray-100 rounded-lg"
              >
                <span className="font-semibold text-gray-900">Abstract</span>
                {isAbstractOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  {paper.abstract}
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {paper.textExtractionError && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              Could not extract full paper text: {paper.textExtractionError}
            </p>
          </div>
        )}
        
        {paper.pdfUrl && (
          <Tabs defaultValue="viewer" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="viewer">PDF Viewer</TabsTrigger>
              <TabsTrigger value="metadata">Paper Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="viewer" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">High-Fidelity PDF Viewer</h3>
                {paper.fullText && (
                  <Badge variant="outline">
                    {(paper.fullText.length / 1000).toFixed(1)}k chars extracted
                  </Badge>
                )}
              </div>
              <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
                <div style={{ height: "70vh" }}>
                  <PdfCanvasViewer pdfUrl={paper.pdfUrl} />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="metadata" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Paper Details</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <p className="text-gray-900">{paper.title}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Authors</label>
                        <p className="text-gray-900">{paper.authors.join(", ")}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <Badge variant="secondary">{paper.category}</Badge>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Published</label>
                        <p className="text-gray-900">{paper.publishedDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Abstract</h4>
                  <ScrollArea className="h-96 rounded-lg border p-4">
                    <p className="text-gray-700 leading-relaxed">{paper.abstract}</p>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Floating Chat Bubble */}
      {paper && <FloatingChatBubble paper={paper} geminiApiKey={geminiApiKey} />}
    </div>
  );
};

export default PaperView;
