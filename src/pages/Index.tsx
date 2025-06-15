import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import EnhancedSearchBar from "@/components/EnhancedSearchBar";
import SearchFilters from "@/components/SearchFilters";
import PapersList from "@/components/PapersList";
import FloatingChatBubble from "@/components/FloatingChatBubble";
import ApiKeyInput from "@/components/ApiKeyInput";
import { parseNaturalLanguageQuery } from "@/utils/queryParser";
import { fetchArxivPapers, ArxivPaper } from "@/utils/arxivApi";
import { getArxivUrlFromQuery } from "@/utils/geminiArxivUrl";
import { extractPdfText } from "@/utils/simplePdfExtractor";
import { Paper } from "@/types/paper";
import { usePagination } from "@/hooks/usePagination";
import { 
  saveSearchState, 
  getSearchState, 
  clearSearchState, 
  isReturningFromPaperView 
} from "@/utils/searchStateManager";
import { Sparkles, BookOpen, TrendingUp } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [papers, setPapers] = useState<ArxivPaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState({
    category: "all",
    year: "",
    author: "",
    sortBy: "date", // Default to date for latest papers
  });

  const pagination = usePagination({ resultsPerPage: 50 });

  // Initialize state from sessionStorage on mount
  useEffect(() => {
    const savedState = getSearchState();
    console.log('Restoring search state:', savedState);
    
    if (isReturningFromPaperView()) {
      // Restore all search state
      setSearchQuery(savedState.query);
      setPapers(savedState.papers);
      setHasSearched(savedState.hasSearched);
      setFilters(savedState.filters);
      
      // Restore pagination state
      pagination.setCurrentPage(savedState.currentPage);
      pagination.setTotalResults(savedState.totalResults);
      
      console.log('Search state restored successfully');
    }

    // Get API key from sessionStorage
    const apiKey = sessionStorage.getItem('geminiApiKey');
    if (apiKey) {
      setGeminiApiKey(apiKey);
    }
  }, []);

  const handleSearch = async (query: string, pageOverride?: number) => {
    const targetPage = pageOverride ?? 1;
    if (targetPage === 1) {
      pagination.resetPagination();
      setHasSearched(true);
    }
    
    setLoading(true);
    setSearchQuery(query);

    const searchParams = {
      maxResults: pagination.resultsPerPage,
      startIndex: pageOverride ? (pageOverride - 1) * pagination.resultsPerPage : pagination.startIndex,
    };

    // Always include current filters in search parameters
    const filtersForSearch = {
      category: filters.category !== 'all' ? filters.category : undefined,
      year: filters.year || undefined,
      author: filters.author || undefined,
      sortBy: filters.sortBy || 'date',
    };

    // Save current search parameters
    saveSearchState({
      query,
      currentPage: targetPage,
      filters,
      hasSearched: true,
    });

    console.log('Searching with filters:', filtersForSearch);

    if (!geminiApiKey) {
      console.log("No Gemini API key found, falling back to basic search");
      // Fallback to basic search without Gemini
      const parsedQuery = parseNaturalLanguageQuery(query);
      try {
        const results = await fetchArxivPapers({
          searchTerms: parsedQuery.searchTerms.length > 0 ? parsedQuery.searchTerms : undefined,
          ...filtersForSearch,
          ...searchParams,
        });
        setPapers(results.papers);
        pagination.setTotalResults(results.totalResults);
        
        // Save results to sessionStorage
        saveSearchState({
          papers: results.papers,
          totalResults: results.totalResults,
          totalPages: Math.ceil(results.totalResults / pagination.resultsPerPage),
        });
      } catch (error) {
        console.error("Error fetching papers:", error);
        setPapers([]);
        pagination.setTotalResults(0);
      }
      setLoading(false);
      return;
    }

    try {
      console.log("Using Gemini to generate arXiv URL for query:", query);
      // Ask Gemini to build optimized arXiv API URL for this query
      const url = await getArxivUrlFromQuery(query, geminiApiKey);
      console.log("Generated URL:", url);
      
      if (!url) {
        console.log("Could not generate valid arXiv URL, using fallback");
        // Fallback to parsed query with filters
        const parsedQuery = parseNaturalLanguageQuery(query);
        const results = await fetchArxivPapers({
          searchTerms: parsedQuery.searchTerms.length > 0 ? parsedQuery.searchTerms : undefined,
          ...filtersForSearch,
          ...searchParams,
        });
        setPapers(results.papers);
        pagination.setTotalResults(results.totalResults);
        
        // Save results to sessionStorage
        saveSearchState({
          papers: results.papers,
          totalResults: results.totalResults,
          totalPages: Math.ceil(results.totalResults / pagination.resultsPerPage),
        });
        setLoading(false);
        return;
      }

      // Modify the URL to include pagination and filter parameters
      const urlObj = new URL(url);
      urlObj.searchParams.set('max_results', searchParams.maxResults.toString());
      urlObj.searchParams.set('start', searchParams.startIndex.toString());
      
      // Apply filters to the generated URL
      if (filtersForSearch.category) {
        // Modify the search query to include category filter
        const currentQuery = urlObj.searchParams.get('search_query') || '';
        const categoryQuery = `cat:${filtersForSearch.category}`;
        const newQuery = currentQuery ? `${currentQuery}+AND+${categoryQuery}` : categoryQuery;
        urlObj.searchParams.set('search_query', newQuery);
      }
      
      if (filtersForSearch.author) {
        const currentQuery = urlObj.searchParams.get('search_query') || '';
        const authorQuery = `au:${filtersForSearch.author}`;
        const newQuery = currentQuery ? `${currentQuery}+AND+${authorQuery}` : authorQuery;
        urlObj.searchParams.set('search_query', newQuery);
      }
      
      if (filtersForSearch.year) {
        const currentQuery = urlObj.searchParams.get('search_query') || '';
        const yearQuery = `submittedDate:[${filtersForSearch.year}01010000+TO+${filtersForSearch.year}12312359]`;
        const newQuery = currentQuery ? `${currentQuery}+AND+${yearQuery}` : yearQuery;
        urlObj.searchParams.set('search_query', newQuery);
      }
      
      // Apply sorting
      if (filtersForSearch.sortBy === 'date') {
        urlObj.searchParams.set('sortBy', 'submittedDate');
        urlObj.searchParams.set('sortOrder', 'descending');
      } else if (filtersForSearch.sortBy === 'relevance') {
        urlObj.searchParams.set('sortBy', 'relevance');
        urlObj.searchParams.set('sortOrder', 'descending');
      } else if (filtersForSearch.sortBy === 'citations') {
        urlObj.searchParams.set('sortBy', 'relevance'); // arXiv doesn't have citations
        urlObj.searchParams.set('sortOrder', 'descending');
      }

      console.log('Final URL with filters:', urlObj.toString());

      // Use the generated URL directly for fetching
      const response = await fetch(urlObj.toString(), { 
        headers: { Accept: "application/atom+xml" } 
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch from arXiv");
      }
      
      const xml = await response.text();
      console.log("Received XML response, parsing...");
      
      // Parse the XML response
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "application/xml");
      
      // Extract total results
      const totalResultsElement = doc.getElementsByTagName("opensearch:totalResults")[0];
      const totalResults = totalResultsElement ? parseInt(totalResultsElement.textContent || "0", 10) : 0;
      pagination.setTotalResults(totalResults);
      
      const entries = Array.from(doc.getElementsByTagName("entry"));
      
      const results: ArxivPaper[] = entries.map((entry) => {
        const id = entry.getElementsByTagName("id")[0]?.textContent ?? "";
        const title = entry.getElementsByTagName("title")[0]?.textContent?.replace(/\s+/g, " ").trim() ?? "";
        const authorTags = Array.from(entry.getElementsByTagName("author"));
        const authors = authorTags.map(a => a.getElementsByTagName("name")[0]?.textContent?.trim() ?? "");
        const summary = entry.getElementsByTagName("summary")[0]?.textContent?.replace(/\s+/g, " ").trim() ?? "";
        const category = entry.getElementsByTagName("category")[0]?.attributes?.getNamedItem("term")?.value ?? "";
        const published = entry.getElementsByTagName("published")[0]?.textContent;
        const publishedDate = published ? new Date(published).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
        
        let pdfUrl = "";
        const pdfLink = Array.from(entry.getElementsByTagName("link")).find(
          (link) => link.getAttribute("title") === "pdf"
        );
        if (pdfLink) {
          pdfUrl = pdfLink.getAttribute("href") ?? "";
        }

        if (!pdfUrl) {
          // The ID is usually the abstract URL, so we can derive the PDF URL.
          // e.g., http://arxiv.org/abs/1234.5678 -> http://arxiv.org/pdf/1234.5678
          if (id.includes("/abs/")) {
            pdfUrl = id.replace("/abs/", "/pdf/");
          } else {
            // Fallback for older ID formats, less common now
            pdfUrl = id.replace("abs", "pdf");
          }
        }
        
        // Always use HTTPS for PDF links to avoid mixed-content issues from browser.
        pdfUrl = pdfUrl.replace(/^http:\/\//i, 'https://');
        
        return {
          id,
          title,
          authors,
          abstract: summary,
          category,
          publishedDate,
          pdfUrl,
        };
      });

      console.log("Parsed results:", results.length, "papers, total:", totalResults);
      setPapers(results);
      
      // Save results to sessionStorage
      saveSearchState({
        papers: results,
        totalResults,
        totalPages: Math.ceil(totalResults / pagination.resultsPerPage),
      });
    } catch (error) {
      console.error("Error in search:", error);
      setPapers([]);
      pagination.setTotalResults(0);
    }
    setLoading(false);
  };

  const handlePageChange = (page: number) => {
    pagination.goToPage(page);
    if (searchQuery) {
      handleSearch(searchQuery, page);
      // Scroll to top of results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFiltersChange = (newFilters: any) => {
    console.log('Filters changed:', newFilters);
    setFilters(newFilters);
    saveSearchState({ filters: newFilters });
    if (searchQuery) {
      pagination.resetPagination();
      handleSearch(searchQuery, 1);
    }
  };

  const handleViewPaper = async (paper: ArxivPaper) => {
    // Save current search state before navigating
    saveSearchState({
      query: searchQuery,
      papers,
      currentPage: pagination.currentPage,
      totalResults: pagination.totalResults,
      totalPages: pagination.totalPages,
      resultsPerPage: pagination.resultsPerPage,
      filters,
      hasSearched,
    });

    // Convert ArxivPaper to Paper format and start text extraction
    const paperWithMetadata: Paper = {
      id: paper.id,
      title: paper.title,
      authors: paper.authors,
      abstract: paper.abstract,
      category: paper.category,
      publishedDate: paper.publishedDate,
      pdfUrl: paper.pdfUrl,
      citations: paper.citations,
    };
    
    // Store in sessionStorage to pass to the paper view page
    sessionStorage.setItem('currentPaper', JSON.stringify(paperWithMetadata));
    sessionStorage.setItem('geminiApiKey', geminiApiKey);
    
    // Navigate to paper view page
    navigate('/paper');
  };

  const handleNewSearch = (query: string) => {
    // Clear previous state for new search
    clearSearchState();
    handleSearch(query, 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />
      
      {/* Enhanced Search Section */}
      <div className={`bg-white border-b border-gray-100 transition-all duration-500 ${
        hasSearched ? "py-4 shadow-md" : "py-12"
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-6">
            {!hasSearched && (
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <BookOpen className="h-8 w-8 text-academic-blue" />
                  <h1 className="text-4xl font-serif font-bold text-gray-900">
                    arXiv Scholar
                  </h1>
                  <Sparkles className="h-6 w-6 text-academic-indigo" />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                  AI-Powered Academic Research
                </h2>
                <p className="text-base text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Search through millions of academic papers with intelligent search capabilities. 
                  Our AI understands natural language queries and finds the most relevant research.
                </p>
                
                <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Latest Papers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>AI-Enhanced</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Full Papers</span>
                  </div>
                </div>
              </div>
            )}
            
            <ApiKeyInput onApiKeyChange={setGeminiApiKey} />
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <EnhancedSearchBar
                  onSearch={handleNewSearch}
                  value={searchQuery}
                  onChange={setSearchQuery}
                  isLoading={loading}
                  hasAI={!!geminiApiKey}
                />
              </div>
              
              {hasSearched && (
                <div className="flex items-center gap-4 text-sm text-gray-600 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-academic-blue border-t-transparent rounded-full animate-spin"></div>
                        <span>Searching...</span>
                      </div>
                    ) : (
                      <span className="font-semibold text-gray-900">
                        {pagination.totalResults > 0 ? 
                          `${pagination.totalResults.toLocaleString()} papers` : 
                          `${papers.length} papers`
                        }
                      </span>
                    )}
                    {geminiApiKey && (
                      <div className="px-2 py-1 bg-gradient-to-r from-academic-blue to-academic-indigo text-white rounded-full text-xs font-medium flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        AI
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {hasSearched && (
              <div className="w-full">
                <SearchFilters onFiltersChange={handleFiltersChange} />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Results Section */}
      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!hasSearched ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gradient-to-br from-academic-blue to-academic-indigo rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-3">
                Ready to explore
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Enter your search query above to discover academic papers across all disciplines
              </p>
            </div>
          ) : (
            <PapersList
              papers={papers}
              onViewPaper={handleViewPaper}
              loading={loading}
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalResults={pagination.totalResults}
              resultsPerPage={pagination.resultsPerPage}
              onPageChange={handlePageChange}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
