
import { useState } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import SearchFilters from "@/components/SearchFilters";
import PapersList from "@/components/PapersList";
import PaperViewer from "@/components/PaperViewer";
import ChatSidebar from "@/components/ChatSidebar";

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

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [papers, setPapers] = useState<Paper[]>(mockPapers);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = (query: string) => {
    setLoading(true);
    console.log("Searching for:", query);
    
    // Simulate search with mock data
    setTimeout(() => {
      if (query.trim()) {
        const filteredPapers = mockPapers.filter(paper => 
          paper.title.toLowerCase().includes(query.toLowerCase()) ||
          paper.abstract.toLowerCase().includes(query.toLowerCase()) ||
          paper.authors.some(author => author.toLowerCase().includes(query.toLowerCase()))
        );
        setPapers(filteredPapers);
      } else {
        setPapers(mockPapers);
      }
      setLoading(false);
    }, 500);
  };

  const handleFiltersChange = (filters: any) => {
    console.log("Filters changed:", filters);
    // In a real app, this would filter the papers based on the filters
  };

  const handleViewPaper = (paper: Paper) => {
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
        <div className={`flex-1 flex flex-col ${selectedPaper ? 'w-1/2' : 'w-full'}`}>
          {/* Search Section */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col space-y-4">
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
                <p className="text-gray-600">
                  {loading ? "Searching..." : `${papers.length} papers found`}
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

        {/* Paper Viewer */}
        {selectedPaper && (
          <div className="w-1/2 flex">
            <div className="w-2/3 border-l border-gray-200">
              <PaperViewer 
                paper={selectedPaper} 
                onClose={handleClosePaper}
              />
            </div>
            {/* Chat Sidebar */}
            <div className="w-1/3">
              <ChatSidebar paperTitle={selectedPaper.title} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
