
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  category: string;
  publishedDate: string;
  pdfUrl: string;
  citations?: number;
}

interface PaperCardProps {
  paper: Paper;
  onViewPaper: (paper: Paper) => void;
}

const PaperCard = ({ paper, onViewPaper }: PaperCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Badge variant="secondary" className="mb-2">
            {paper.category}
          </Badge>
          <span className="text-sm text-gray-500">{paper.publishedDate}</span>
        </div>
        <h3 className="font-semibold text-lg leading-tight text-gray-900 hover:text-blue-900 cursor-pointer">
          {paper.title}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {paper.authors.join(", ")}
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 text-sm line-clamp-3 mb-4">
          {paper.abstract}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {paper.citations && (
              <span className="text-sm text-gray-500">
                {paper.citations} citations
              </span>
            )}
          </div>
          <Button 
            onClick={() => onViewPaper(paper)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            View Paper
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaperCard;
