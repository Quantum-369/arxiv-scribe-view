
export interface ArxivPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  category: string;
  publishedDate: string;
  pdfUrl: string;
  citations?: number;
}

export interface ArxivResponse {
  papers: ArxivPaper[];
  totalResults: number;
}

const BASE_URL = "https://export.arxiv.org/api/query";

// Fallback queries that are guaranteed to return results
const FALLBACK_QUERIES = [
  'all:"artificial+intelligence"+OR+all:"machine+learning"+OR+all:"AI"',
  'all:"economic"+OR+all:"economy"+OR+all:"financial"',
  'all:"prediction"+OR+all:"forecast"+OR+all:"model"',
  'all:"deep+learning"+OR+all:"neural+network"',
  'all:"computer+science"+OR+all:"algorithm"'
];

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
    // Create very broad OR-based search
    const searchQuery = params.searchTerms.map((t) => `all:"${t.replace(/\s+/g, '+')}"`).join("+OR+");
    q.push(`(${searchQuery})`);
  }

  // Only add category filter if it's very specific
  if (params.category && params.category !== "all" && params.category.includes('.')) {
    q.push(`cat:${params.category}`);
  }

  if (params.author) {
    q.push(`au:"${params.author}"`);
  }

  if (params.year) {
    q.push(`submittedDate:[${params.year}01010000+TO+${params.year}12312359]`);
  }

  // Build final query
  let finalQuery = q.length > 0 ? q.join("+AND+") : FALLBACK_QUERIES[0];

  // Handle sorting
  let sortBy = "relevance";
  let sortOrder = "descending";
  
  if (params.sortBy === "date") {
    sortBy = "submittedDate";
    sortOrder = "descending";
  }

  const queryString = [
    `search_query=${encodeURIComponent(finalQuery)}`,
    `sortBy=${sortBy}`,
    `sortOrder=${sortOrder}`,
    `max_results=${params.maxResults ?? 50}`,
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
  console.log('Fetching from arXiv URL:', url);
  
  try {
    const response = await fetch(url, { headers: { Accept: "application/atom+xml" } });
    if (!response.ok) throw new Error(`arXiv API returned ${response.status}`);
    
    const xml = await response.text();
    const result = parseArxivAtomFeed(xml);
    
    console.log(`arXiv search returned ${result.totalResults} total results, ${result.papers.length} papers`);
    
    // If we got zero results, try a fallback query
    if (result.totalResults === 0 && params.searchTerms && params.searchTerms.length > 0) {
      console.log('Zero results, trying fallback query...');
      const fallbackUrl = BASE_URL + `?search_query=${encodeURIComponent(FALLBACK_QUERIES[0])}&sortBy=relevance&max_results=50&start=0`;
      console.log('Fallback URL:', fallbackUrl);
      
      const fallbackResponse = await fetch(fallbackUrl, { headers: { Accept: "application/atom+xml" } });
      if (fallbackResponse.ok) {
        const fallbackXml = await fallbackResponse.text();
        const fallbackResult = parseArxivAtomFeed(fallbackXml);
        console.log(`Fallback query returned ${fallbackResult.totalResults} results`);
        return fallbackResult;
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching from arXiv:', error);
    throw error;
  }
}

function parseArxivAtomFeed(xml: string): ArxivResponse {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  
  // Check for parsing errors
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    console.error('XML parsing error:', parseError.textContent);
    return { papers: [], totalResults: 0 };
  }
  
  // Extract total results
  const totalResultsElement = doc.getElementsByTagName("opensearch:totalResults")[0];
  const totalResults = totalResultsElement ? parseInt(totalResultsElement.textContent || "0", 10) : 0;
  
  const entries = Array.from(doc.getElementsByTagName("entry"));
  const papers = entries.map((entry) => {
    const id = entry.getElementsByTagName("id")[0]?.textContent ?? "";
    const title = entry.getElementsByTagName("title")[0]?.textContent?.replace(/\s+/g, " ").trim() ?? "";
    const authorTags = Array.from(entry.getElementsByTagName("author"));
    const authors = authorTags.map(a => a.getElementsByTagName("name")[0]?.textContent?.trim() ?? "");
    const summary = entry.getElementsByTagName("summary")[0]?.textContent?.replace(/\s+/g, " ").trim() ?? "";
    const category = entry.getElementsByTagName("category")[0]?.attributes?.getNamedItem("term")?.value ?? "";
    const published = entry.getElementsByTagName("published")[0]?.textContent;
    const publishedDate = published ? new Date(published).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
    
    // Construct PDF URL
    let pdfUrl = "";
    const idMatch = id.match(/(\d{4}\.\d{4,5})/);
    if (idMatch) {
      pdfUrl = `https://arxiv.org/pdf/${idMatch[1]}.pdf`;
    } else {
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

  console.log(`Parsed ${papers.length} papers from XML`);
  return { papers, totalResults };
}
