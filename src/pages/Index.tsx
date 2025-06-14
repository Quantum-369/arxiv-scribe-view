import { useState, useEffect } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import SearchFilters from "@/components/SearchFilters";
import PapersList from "@/components/PapersList";
import PaperViewer from "@/components/PaperViewer";
import FloatingChatBubble from "@/components/FloatingChatBubble";
import { parseNaturalLanguageQuery } from "@/utils/queryParser";
import { fetchArxivPapers, ArxivPaper } from "@/utils/arxivApi";
import { getArxivUrlFromQuery } from "@/utils/geminiArxivUrl";

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

// Mock data for demonstration
const mockPapers: Paper[] = [
  {
    id: "1",
    title: "Attention Is All You Need",
    authors: ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar", "Jakob Uszkoreit"],
    abstract: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.",
    category: "Computer Science",
    publishedDate: "Dec 6, 2017",
    pdfUrl: "/papers/attention.pdf",
    citations: 50000
  },
  {
    id: "2",
    title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
    authors: ["Jacob Devlin", "Ming-Wei Chang", "Kenton Lee", "Kristina Toutanova"],
    abstract: "We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers.",
    category: "Computer Science",
    publishedDate: "Oct 11, 2018",
    pdfUrl: "/papers/bert.pdf",
    citations: 45000
  },
  {
    id: "3",
    title: "Generative Pre-trained Transformers",
    authors: ["Alec Radford", "Karthik Narasimhan", "Tim Salimans", "Ilya Sutskever"],
    abstract: "Natural language understanding comprises a wide range of diverse tasks such as textual entailment, question answering, and semantic similarity assessment. Although large unlabeled text corpora are abundant, labeled data for learning these specific tasks is scarce, making it challenging for discriminatively trained models to perform adequately.",
    category: "Computer Science",
    publishedDate: "Jun 11, 2018",
    pdfUrl: "/papers/gpt.pdf",
    citations: 35000
  }
];

const GEMINI_API_KEY_PLACEHOLDER = "YOUR_GEMINI_API_KEY_HERE"; // <-- Provide your Gemini API key here or via environment variable

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [papers, setPapers] = useState<ArxivPaper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<ArxivPaper | null>(null);
  const [loading, setLoading] = useState(false);
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

    // You must provide your Gemini API key in GEMINI_API_KEY
    const apiKey =
      process.env.GEMINI_API_KEY ||
      (window && (window as any).GEMINI_API_KEY) ||
      GEMINI_API_KEY_PLACEHOLDER;
    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
      alert(
        "Please set your Gemini API key as GEMINI_API_KEY (in your project env or connect to Supabase secrets)."
      );
      setLoading(false);
      return;
    }

    try {
      // Ask Gemini to build optimized arXiv API URL for this query
      const url = await getArxivUrlFromQuery(query, apiKey);
      if (!url) {
        alert("Sorry, could not understand or generate a valid arXiv URL for your query.");
        setPapers([]);
        setLoading(false);
        return;
      }
      // Fetch live arXiv results using that URL
      // We only need the query/path, not base, for fetchArxivPapers, so:
      const urlObj = new URL(url);
      const searchParams = urlObj.searchParams;
      const search_query = searchParams.get("search_query") || undefined;
      const sortBy = searchParams.get("sortBy") || undefined;
      const sortOrder = searchParams.get("sortOrder") || undefined;
      const max_results = searchParams.get("max_results") || undefined;
      const start = searchParams.get("start") || undefined;

      const results = await fetchArxivPapers({
        // This expects a break-down, so map URL params (or just pass the URL if you want to enhance fetchArxivPapers)
        searchTerms: search_query && search_query !== "all:" ? search_query.split("+AND+").map(x => x.replace(/^all:/, "")) : undefined,
        sortBy: sortBy,
        maxResults: max_results ? Number(max_results) : 16,
        startIndex: start ? Number(start) : 0,
        // Advanced: Category/year filter extraction from the search_query param can be done here
      });
      setPapers(results);
    } catch (e) {
      setPapers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    // on first mount and whenever filters change but not searchQuery, keep list in sync
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  }, []);

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    // auto-search if search query present
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  };

  const handleViewPaper = (paper: ArxivPaper) => {
    setSelectedPaper(paper);
  };

  const handleClosePaper = () => {
    setSelectedPaper(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex h-[calc(100vh-64px)]">
        {/* Main Content */}
        <div className={`flex-1 flex flex-col ${selectedPaper ? "w-1/2" : "w-full"}`}>
          {/* Search Section */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col space-y-4">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Search Academic Papers</h2>
                  <p className="text-gray-600">Try: "Today's published AI papers" or "Latest machine learning research"</p>
                </div>
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
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-4">
                <p className="text-gray-600">{loading ? "Searching..." : `${papers.length} papers found`}</p>
              </div>
              <PapersList
                papers={papers}
                onViewPaper={handleViewPaper}
                loading={loading}
              />
            </div>
          </div>
        </div>
        {/* Paper Viewer */}
        {selectedPaper && (
          <div className="w-1/2 border-l border-gray-200">
            <PaperViewer
              paper={selectedPaper}
              onClose={handleClosePaper}
            />
          </div>
        )}
      </div>
      {/* Floating Chat Bubble only when a paper is selected */}
      {selectedPaper && <FloatingChatBubble paperTitle={selectedPaper.title} />}
    </div>
  );
};

export default Index;
