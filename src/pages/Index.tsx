import { useState, useEffect } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import SearchFilters from "@/components/SearchFilters";
import PapersList from "@/components/PapersList";
import PaperViewer from "@/components/PaperViewer";
import FloatingChatBubble from "@/components/FloatingChatBubble";
import ApiKeyInput from "@/components/ApiKeyInput";
import { parseNaturalLanguageQuery } from "@/utils/queryParser";
import { fetchArxivPapers, ArxivPaper } from "@/utils/arxivApi";
import { getArxivUrlFromQuery } from "@/utils/geminiArxivUrl";
import { extractPdfText } from "@/utils/pdfExtractor";
import { Paper } from "@/types/paper";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [papers, setPapers] = useState<ArxivPaper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [filters, setFilters] = useState({
    category: "all",
    year: "",
    author: "",
    sortBy: "relevance",
  });

  // Gemini-powered search
  const handleSearch = async (query: string) => {
    setLoading(true);
    setSearchQuery(query);

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
          maxResults: 16,
          startIndex: 0,
        });
        setPapers(results);
      } catch (error) {
        console.error("Error fetching papers:", error);
        setPapers([]);
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
          maxResults: 16,
          startIndex: 0,
        });
        setPapers(results);
        setLoading(false);
        return;
      }

      // Use the generated URL directly for fetching
      const response = await fetch(url, { 
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
        Array.from(entry.getElementsByTagName("link")).forEach((link) => {
          if (link.getAttribute("title") === "pdf") {
            pdfUrl = link.getAttribute("href") ?? "";
          }
        });
        if (!pdfUrl) {
          pdfUrl = id.replace("abs", "pdf");
        }
        
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

      console.log("Parsed results:", results.length, "papers");
      setPapers(results);
    } catch (error) {
      console.error("Error in search:", error);
      setPapers([]);
    }
    setLoading(false);
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    if (searchQuery) {
      handleSearch(searchQuery);
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
    
    setSelectedPaper(paperWithMetadata);
    
    // Extract PDF text in the background
    console.log('Starting PDF text extraction for:', paper.title);
    try {
      const { text, error } = await extractPdfText(paper.pdfUrl);
      
      setSelectedPaper(prev => prev ? {
        ...prev,
        fullText: text || undefined,
        textExtractionError: error
      } : null);
      
      if (text) {
        console.log('PDF text extraction successful, length:', text.length);
      } else if (error) {
        console.log('PDF text extraction failed:', error);
      }
    } catch (error) {
      console.error('Error during PDF text extraction:', error);
      setSelectedPaper(prev => prev ? {
        ...prev,
        textExtractionError: 'Failed to extract PDF text'
      } : null);
    }
  };

  const handleClosePaper = () => {
    setSelectedPaper(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
        {/* Main Content */}
        <div className={`flex-1 flex flex-col ${selectedPaper ? "lg:w-1/2" : "w-full"}`}>
          {/* Search Section */}
          <div className="bg-white border-b border-gray-200 p-4 lg:p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col space-y-4">
                <div className="text-center mb-4">
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Search Academic Papers</h2>
                  <p className="text-sm lg:text-base text-gray-600">Try: "machine learning transformers" or "quantum computing 2024"</p>
                </div>
                <ApiKeyInput onApiKeyChange={setGeminiApiKey} />
                <SearchBar
                  onSearch={handleSearch}
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
                <SearchFilters onFiltersChange={handleFiltersChange} />
              </div>
            </div>
          </div>
          {/* Results Section */}
          <div className="flex-1 overflow-auto p-4 lg:p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-4">
                <p className="text-sm lg:text-base text-gray-600">
                  {loading ? "Searching..." : `${papers.length} papers found`}
                  {geminiApiKey && " (AI-enhanced search enabled)"}
                </p>
              </div>
              <PapersList
                papers={papers}
                onViewPaper={handleViewPaper}
                loading={loading}
              />
            </div>
          </div>
        </div>
        {/* Paper Viewer - Mobile: Full screen overlay, Desktop: Side panel */}
        {selectedPaper && (
          <div className="fixed inset-0 lg:relative lg:w-1/2 lg:border-l border-gray-200 z-40 lg:z-auto">
            <PaperViewer
              paper={selectedPaper}
              onClose={handleClosePaper}
            />
          </div>
        )}
      </div>
      {/* Floating Chat Bubble */}
      {selectedPaper && <FloatingChatBubble paper={selectedPaper} geminiApiKey={geminiApiKey} />}
    </div>
  );
};

export default Index;
