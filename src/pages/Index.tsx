import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
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
    sortBy: "relevance",
  });

  const pagination = usePagination({ resultsPerPage: 50 });

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

    if (!geminiApiKey) {
      console.log("No Gemini API key found, falling back to basic search");
      // Fallback to basic search without Gemini
      const parsedQuery = parseNaturalLanguageQuery(query);
      try {
        const results = await fetchArxivPapers({
          searchTerms: parsedQuery.searchTerms.length > 0 ? parsedQuery.searchTerms : undefined,
          category: parsedQuery.category,
          year: parsedQuery.dateFilter,
          sortBy: parsedQuery.sortBy,
          ...searchParams,
        });
        setPapers(results.papers);
        pagination.setTotalResults(results.totalResults);
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
        // Fallback to parsed query
        const parsedQuery = parseNaturalLanguageQuery(query);
        const results = await fetchArxivPapers({
          searchTerms: parsedQuery.searchTerms.length > 0 ? parsedQuery.searchTerms : undefined,
          category: parsedQuery.category,
          year: parsedQuery.dateFilter,
          sortBy: parsedQuery.sortBy,
          ...searchParams,
        });
        setPapers(results.papers);
        pagination.setTotalResults(results.totalResults);
        setLoading(false);
        return;
      }

      // Modify the URL to include pagination parameters
      const urlObj = new URL(url);
      urlObj.searchParams.set('max_results', searchParams.maxResults.toString());
      urlObj.searchParams.set('start', searchParams.startIndex.toString());

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
    setFilters(newFilters);
    if (searchQuery) {
      pagination.resetPagination();
      handleSearch(searchQuery, 1);
    }
  };

  const handleViewPaper = async (paper: ArxivPaper) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Search Section - More compact when results are shown */}
      <div className={`bg-white border-b border-gray-200 transition-all duration-300 ${
        hasSearched ? "py-3 shadow-sm" : "py-8"
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-4">
            {!hasSearched && (
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                  arXiv Scholar
                </h1>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
                  Search Academic Papers
                </h2>
                <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                  Search through millions of academic papers with AI-enhanced search capabilities. 
                  Try: "machine learning transformers" or "quantum computing 2024"
                </p>
              </div>
            )}
            
            <ApiKeyInput onApiKeyChange={setGeminiApiKey} />
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
              <div className="flex-1 w-full">
                <SearchBar
                  onSearch={(query) => handleSearch(query, 1)}
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
              </div>
              
              {hasSearched && (
                <div className="flex items-center gap-4 text-sm text-gray-600 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Searching...</span>
                      </div>
                    ) : (
                      <span className="font-medium">
                        {pagination.totalResults > 0 ? 
                          `${pagination.totalResults.toLocaleString()} papers` : 
                          `${papers.length} papers`
                        }
                      </span>
                    )}
                    {geminiApiKey && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        AI
                      </span>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {!hasSearched ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to search</h3>
              <p className="text-gray-600">Enter your search query above to find academic papers</p>
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
