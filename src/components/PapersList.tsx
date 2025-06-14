
import PaperCard from "./PaperCard";

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

interface PapersListProps {
  papers: Paper[];
  onViewPaper: (paper: Paper) => void;
  loading?: boolean;
}

const PapersList = ({ papers, onViewPaper, loading }: PapersListProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-48"></div>
          </div>
        ))}
      </div>
    );
  }

  if (papers.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No papers found</h3>
        <p className="text-gray-600">Try adjusting your search terms or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {papers.map((paper) => (
        <PaperCard 
          key={paper.id} 
          paper={paper} 
          onViewPaper={onViewPaper}
        />
      ))}
    </div>
  );
};

export default PapersList;
