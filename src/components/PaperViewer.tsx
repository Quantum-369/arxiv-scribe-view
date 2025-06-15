
import { Button } from "@/components/ui/button";
import { X, Download, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Paper } from "@/types/paper";

interface PaperViewerProps {
  paper: Paper;
  onClose: () => void;
}

const PaperViewer = ({ paper, onClose }: PaperViewerProps) => {
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
      <div className="flex items-start justify-between p-6 border-b border-gray-100">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center space-x-3 mb-3">
            <Badge variant="secondary" className="text-xs font-medium">
              {paper.category}
            </Badge>
            <span className="text-sm text-gray-500">{paper.publishedDate}</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 leading-tight mb-2">
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

      {/* Abstract */}
      <div className="p-6 bg-gray-50 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Abstract</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          {paper.abstract}
        </p>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto">
        {paper.textExtractionError && (
          <div className="m-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              Could not extract full paper text: {paper.textExtractionError}
            </p>
          </div>
        )}
        
        {paper.fullText ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Full Paper Content</h3>
              <Badge variant="outline" className="text-xs">
                {(paper.fullText.length / 1000).toFixed(1)}k chars
              </Badge>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-mono">
                {paper.fullText}
              </div>
            </div>
          </div>
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
