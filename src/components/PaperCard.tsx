
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
    <Card className="hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <Badge variant="secondary" className="w-fit text-xs font-medium">
            {paper.category}
          </Badge>
          <span className="text-sm text-gray-500">{paper.publishedDate}</span>
        </div>
        <h3 className="font-semibold text-lg leading-tight text-gray-900 hover:text-blue-900 cursor-pointer line-clamp-2">
          {paper.title}
        </h3>
        <p className="text-sm text-gray-600 mt-1 line-clamp-1">
          {paper.authors.join(", ")}
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 text-sm line-clamp-3 mb-4 leading-relaxed">
          {paper.abstract}
        </p>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center space-x-4">
            {paper.citations && (
              <span className="text-sm text-gray-500">
                {paper.citations} citations
              </span>
            )}
          </div>
          <Button 
            onClick={() => onViewPaper(paper)}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
          >
            View Paper
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaperCard;
