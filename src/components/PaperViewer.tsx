
import { Button } from "@/components/ui/button";
import { X, Download, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Paper } from "@/types/paper";

interface PaperViewerProps {
  paper: Paper;
  onClose: () => void;
}

const PaperViewer = ({ paper, onClose }: PaperViewerProps) => {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex-1 min-w-0">
          <Badge variant="secondary" className="mb-2">
            {paper.category}
          </Badge>
          <h2 className="text-xl font-semibold text-gray-900 truncate">
            {paper.title}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {paper.authors.join(", ")}
          </p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Abstract */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-medium text-gray-900 mb-2">Abstract</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          {paper.abstract}
        </p>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto p-4">
        {paper.textExtractionError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800">
              Could not extract full paper text: {paper.textExtractionError}
            </p>
          </div>
        )}
        
        {paper.fullText ? (
          <div className="bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Full Paper Content</h3>
              <Badge variant="outline" className="text-xs">
                {(paper.fullText.length / 1000).toFixed(1)}k characters
              </Badge>
            </div>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-mono">
                {paper.fullText}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="bg-gray-200 text-gray-600 p-8 rounded-lg mb-4">
                <p className="text-lg font-medium">Extracting PDF content...</p>
              </div>
              <p className="text-gray-600 mb-4">
                The full paper text is being extracted from the PDF
              </p>
              <p className="text-sm text-gray-500">
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
