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

      {/* PDF Viewer */}
      <div className="flex-1 bg-gray-100">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-600 text-white p-8 rounded-lg mb-4">
              PDF
            </div>
            <p className="text-gray-600 mb-4">PDF viewer would be embedded here</p>
            <p className="text-sm text-gray-500">
              In a real implementation, you would use a PDF viewer library like react-pdf or pdf.js
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperViewer;
