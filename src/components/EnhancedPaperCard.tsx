
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, ExternalLink, Bookmark } from "lucide-react";

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

interface EnhancedPaperCardProps {
  paper: Paper;
  onViewPaper: (paper: Paper) => void;
}

const getCategoryColor = (category: string) => {
  const colors = {
    'cs': 'bg-academic-blue/10 text-academic-blue border-academic-blue/20',
    'math': 'bg-academic-indigo/10 text-academic-indigo border-academic-indigo/20',
    'physics': 'bg-academic-purple/10 text-academic-purple border-academic-purple/20',
    'q-bio': 'bg-academic-teal/10 text-academic-teal border-academic-teal/20',
    'q-fin': 'bg-academic-emerald/10 text-academic-emerald border-academic-emerald/20',
    'stat': 'bg-academic-amber/10 text-academic-amber border-academic-amber/20',
    'eess': 'bg-academic-orange/10 text-academic-orange border-academic-orange/20',
    'econ': 'bg-academic-rose/10 text-academic-rose border-academic-rose/20',
  };
  
  const prefix = category.split('.')[0] || category.split('-')[0];
  return colors[prefix as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200';
};

const EnhancedPaperCard = ({ paper, onViewPaper }: EnhancedPaperCardProps) => {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/50 animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge 
              variant="outline" 
              className={`text-xs font-medium ${getCategoryColor(paper.category)}`}
            >
              {paper.category}
            </Badge>
            {paper.citations && paper.citations > 10 && (
              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                {paper.citations} citations
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>{paper.publishedDate}</span>
          </div>
        </div>
        
        <h3 
          className="font-serif font-semibold text-xl leading-tight text-gray-900 hover:text-academic-blue cursor-pointer transition-colors duration-200 line-clamp-2 group-hover:line-clamp-none"
          onClick={() => onViewPaper(paper)}
        >
          {paper.title}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-3 w-3" />
          <p className="line-clamp-1">
            {paper.authors.slice(0, 3).join(", ")}
            {paper.authors.length > 3 && ` +${paper.authors.length - 3} more`}
          </p>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-700 text-sm line-clamp-3 group-hover:line-clamp-4 mb-6 leading-relaxed transition-all duration-200">
          {paper.abstract}
        </p>
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center space-x-4">
            {paper.citations && (
              <span className="text-sm text-gray-500 font-medium">
                {paper.citations.toLocaleString()} citations
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(paper.pdfUrl, '_blank')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ExternalLink className="h-3 w-3" />
              PDF
            </Button>
            <Button 
              onClick={() => onViewPaper(paper)}
              className="bg-academic-blue hover:bg-academic-blue/90 text-white flex items-center gap-2 transition-colors duration-200"
              size="sm"
            >
              <Bookmark className="h-3 w-3" />
              View Paper
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedPaperCard;
