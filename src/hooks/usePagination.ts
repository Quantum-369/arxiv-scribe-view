
import { useState } from 'react';

interface UsePaginationProps {
  initialPage?: number;
  resultsPerPage?: number;
}

export const usePagination = ({ 
  initialPage = 1, 
  resultsPerPage = 50 
}: UsePaginationProps = {}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);
  const resetPagination = () => {
    setCurrentPage(1);
    setTotalResults(0);
  };

  return {
    currentPage,
    totalPages,
    totalResults,
    resultsPerPage,
    startIndex,
    isLoadingMore,
    setIsLoadingMore,
    setTotalResults,
    goToPage,
    nextPage,
    prevPage,
    resetPagination,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};
