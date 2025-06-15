export interface ArxivPaper {
  id: string; // e.g., arxiv URL
  title: string;
  authors: string[];
  abstract: string;
  category: string;
  publishedDate: string;
  pdfUrl: string;
  citations?: number; // not available via arXiv API
}

export interface ArxivResponse {
  papers: ArxivPaper[];
  totalResults: number;
}

const BASE_URL = "https://export.arxiv.org/api/query";

export function buildArxivQuery(params: {
  searchTerms?: string[];
  category?: string;
  year?: string;
  author?: string;
  sortBy?: string;
  maxResults?: number;
  startIndex?: number;
}) {
  let q: string[] = [];

  if (params.searchTerms && params.searchTerms.length > 0) {
    // Use much broader search with OR operators for maximum results
    const searchQuery = params.searchTerms.map((t) => `all:"${t}"`).join("+OR+");
    q.push(`(${searchQuery})`);
  }

  // Remove category restrictions completely unless very specific
  if (params.category && params.category !== "all" && params.category.includes('.') && params.category.length < 10) {
    q.push(`cat:${params.category}`);
  }

  if (params.author) {
    q.push(`au:"${params.author}"`);
  }

  if (params.year) {
    q.push(`submittedDate:[${params.year}01010000+TO+${params.year}12312359]`);
  }

  // If no search terms, create a very broad search
  let finalQuery = "all:*"; // Default to everything
  if (q.length > 0) {
    finalQuery = q.join("+AND+");
  }

  // Handle sorting
  let sortBy = "relevance"; // Default to relevance for better matching
  let sortOrder = "descending";
  
  if (params.sortBy === "date") {
    sortBy = "submittedDate";
    sortOrder = "descending";
  } else if (params.sortBy === "citations") {
    sortBy = "relevance"; // arXiv API doesn't support citations
    sortOrder = "descending";
  }

  const queryString = [
    `search_query=${encodeURIComponent(finalQuery)}`,
    `sortBy=${sortBy}`,
    `sortOrder=${sortOrder}`,
    `max_results=${params.maxResults ?? 40}`, // Increased default from 50 to 40
    `start=${params.startIndex ?? 0}`,
  ].join("&");

  const finalUrl = BASE_URL + "?" + queryString;
  console.log('Built arXiv URL:', finalUrl);
  return finalUrl;
}

export async function fetchArxivPapers(
  params: Parameters<typeof buildArxivQuery>[0]
): Promise<ArxivResponse> {
  const url = buildArxivQuery(params);
  console.log('Built arXiv URL:', url);
  const response = await fetch(url, { headers: { Accept: "application/atom+xml" } });
  if (!response.ok) throw new Error("Failed to fetch from arXiv");
  const xml = await response.text();
  return parseArxivAtomFeed(xml);
}

function parseArxivAtomFeed(xml: string): ArxivResponse {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  
  // Extract total results from opensearch:totalResults
  const totalResultsElement = doc.getElementsByTagName("opensearch:totalResults")[0];
  const totalResults = totalResultsElement ? parseInt(totalResultsElement.textContent || "0", 10) : 0;
  
  const entries = Array.from(doc.getElementsByTagName("entry"));
  const papers = entries.map((entry) => {
    const id = entry.getElementsByTagName("id")[0]?.textContent ?? "";
    const title = entry.getElementsByTagName("title")[0]?.textContent?.replace(/\s+/g, " ").trim() ?? "";
    const authorTags = Array.from(entry.getElementsByTagName("author"));
    const authors = authorTags.map(a => a.getElementsByTagName("name")[0]?.textContent?.trim() ?? "");
    const summary = entry.getElementsByTagName("summary")[0]?.textContent?.replace(/\s+/g, " ").trim() ?? "";
    const category =
      entry.getElementsByTagName("category")[0]?.attributes?.getNamedItem("term")?.value ?? "";
    const published = entry.getElementsByTagName("published")[0]?.textContent;
    const publishedDate = published ? new Date(published).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
    
    // Simplified PDF URL construction - extract arXiv ID and construct direct PDF URL
    let pdfUrl = "";
    const idMatch = id.match(/(\d{4}\.\d{4,5})/);
    if (idMatch) {
      pdfUrl = `https://arxiv.org/pdf/${idMatch[1]}.pdf`;
    } else {
      // Fallback - try to construct from the ID
      const cleanId = id.replace(/^.*\//, '').replace('abs/', '');
      pdfUrl = `https://arxiv.org/pdf/${cleanId}.pdf`;
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

  return { papers, totalResults };
}
