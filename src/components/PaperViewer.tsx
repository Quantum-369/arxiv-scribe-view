import { Button } from "@/components/ui/button";
import { X, Download, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Paper } from "@/types/paper";
import { useState } from "react";
import PdfCanvasViewer from "./PdfCanvasViewer";

interface PaperViewerProps {
  paper: Paper;
  onClose: () => void;
}

const PaperViewer = ({ paper, onClose }: PaperViewerProps) => {
  const [isAbstractOpen, setIsAbstractOpen] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = paper.pdfUrl;
    link.download = `${paper.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(paper.pdfUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-gray-100 bg-white">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center space-x-3 mb-2">
            <Badge variant="secondary" className="text-xs font-medium">
              {paper.category}
            </Badge>
            <span className="text-sm text-gray-500">{paper.publishedDate}</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 leading-tight mb-1">
            {paper.title}
          </h2>
          <p className="text-sm text-gray-600">
            {paper.authors.join(", ")}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleDownload} className="text-xs">
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handleOpenInNewTab} className="text-xs">
            <ExternalLink className="h-4 w-4 mr-1" />
            Open PDF
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Collapsible Abstract */}
      <Collapsible open={isAbstractOpen} onOpenChange={setIsAbstractOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-4 h-auto border-b border-gray-100 hover:bg-gray-50"
          >
            <span className="text-sm font-semibold text-gray-900">Abstract</span>
            {isAbstractOpen ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="border-b border-gray-100">
          <div className="p-4 bg-gray-50">
            <p className="text-sm text-gray-700 leading-relaxed">
              {paper.abstract}
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {paper.textExtractionError && (
          <div className="m-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              Could not extract full paper text: {paper.textExtractionError}
            </p>
          </div>
        )}
        
        {/* Always show the PDF viewer when a PDF URL is present */}
        {paper.pdfUrl ? (
          <Tabs defaultValue="content" className="h-full flex flex-col">
            <TabsList className="mx-4 mt-4 grid w-auto grid-cols-2">
              <TabsTrigger value="content">Full Paper View</TabsTrigger>
              <TabsTrigger value="metadata">Paper Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="flex-1 overflow-hidden m-4 mt-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">High-Fidelity PDF Viewer</h3>
                <Badge variant="outline" className="text-xs">
                  {paper.fullText ? ((paper.fullText.length / 1000).toFixed(1) + "k chars") : ""}
                </Badge>
              </div>
              <div className="border border-gray-200 rounded-lg bg-gray-50 w-full overflow-auto" style={{ maxHeight: "65vh" }}>
                <PdfCanvasViewer pdfUrl={paper.pdfUrl} />
              </div>
            </TabsContent>
            
            <TabsContent value="metadata" className="flex-1 overflow-hidden m-4 mt-2">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Title</h4>
                    <p className="text-sm text-gray-700">{paper.title}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Authors</h4>
                    <p className="text-sm text-gray-700">{paper.authors.join(", ")}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Category</h4>
                    <Badge variant="secondary">{paper.category}</Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Published Date</h4>
                    <p className="text-sm text-gray-700">{paper.publishedDate}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Abstract</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{paper.abstract}</p>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Extracting PDF content</h3>
              <p className="text-sm text-gray-600">
                This may take a few moments depending on the paper length
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaperViewer;
