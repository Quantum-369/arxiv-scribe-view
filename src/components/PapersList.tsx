
import EnhancedPaperCard from "./EnhancedPaperCard";
import PaperCardSkeleton from "./PaperCardSkeleton";
import PaginationControls from "./PaginationControls";

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
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  totalResults?: number;
  resultsPerPage?: number;
  onPageChange?: (page: number) => void;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

const PapersList = ({ 
  papers, 
  onViewPaper, 
  loading,
  currentPage = 1,
  totalPages = 1,
  totalResults = 0,
  resultsPerPage = 50,
  onPageChange,
  hasNextPage = false,
  hasPrevPage = false,
}: PapersListProps) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <PaperCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (papers.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-serif font-semibold text-gray-900 mb-2">No papers found</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Try adjusting your search terms or filters. Consider using broader keywords or checking different categories.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {papers.map((paper, index) => (
          <div key={paper.id} style={{ animationDelay: `${index * 50}ms` }}>
            <EnhancedPaperCard 
              paper={paper} 
              onViewPaper={onViewPaper}
            />
          </div>
        ))}
      </div>
      
      {onPageChange && totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalResults={totalResults}
          resultsPerPage={resultsPerPage}
          onPageChange={onPageChange}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          isLoading={loading}
        />
      )}
    </div>
  );
};

export default PapersList;
