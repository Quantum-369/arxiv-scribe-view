
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

const BASE_URL = "https://export.arxiv.org/api/query";

export function buildArxivQuery(params: {
  searchTerms?: string[];
  category?: string;
  year?: string;
  sortBy?: string;
  maxResults?: number;
  startIndex?: number;
}) {
  let q: string[] = [];

  if (params.searchTerms && params.searchTerms.length > 0) {
    // For arXiv, join terms by 'AND'
    q.push(params.searchTerms.map((t) => `all:${t}`).join("+AND+"));
  }

  if (params.category && params.category !== "all") {
    q.push(`cat:${params.category.replace("-", ".")}`);
  }

  if (params.year) {
    // arXiv doesn't have a direct year param - use submittedDate instead (YYYY)
    q.push(`submittedDate:[${params.year}01010000+TO+${params.year}12312359]`);
  }

  let sortBy = "relevance";
  if (params.sortBy === "date") sortBy = "submittedDate";
  else if (params.sortBy === "citations") sortBy = "relevance"; // arXiv API doesn't support citations

  const queryString = [
    `search_query=${encodeURIComponent(q.join("+AND+") || "all:")}`,
    `sortBy=${sortBy}`,
    `sortOrder=descending`,
    `max_results=${Math.min(params.maxResults ?? 16, 32)}`,
    `start=${params.startIndex ?? 0}`,
  ].join("&");

  return BASE_URL + "?" + queryString;
}

export async function fetchArxivPapers(
  params: Parameters<typeof buildArxivQuery>[0]
): Promise<ArxivPaper[]> {
  const url = buildArxivQuery(params);
  const response = await fetch(url, { headers: { Accept: "application/atom+xml" } });
  if (!response.ok) throw new Error("Failed to fetch from arXiv");
  const xml = await response.text();
  return parseArxivAtomFeed(xml);
}

function parseArxivAtomFeed(xml: string): ArxivPaper[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  const entries = Array.from(doc.getElementsByTagName("entry"));
  return entries.map((entry) => {
    const id = entry.getElementsByTagName("id")[0]?.textContent ?? "";
    const title = entry.getElementsByTagName("title")[0]?.textContent?.replace(/\s+/g, " ").trim() ?? "";
    const authorTags = Array.from(entry.getElementsByTagName("author"));
    const authors = authorTags.map(a => a.getElementsByTagName("name")[0]?.textContent?.trim() ?? "");
    const summary = entry.getElementsByTagName("summary")[0]?.textContent?.replace(/\s+/g, " ").trim() ?? "";
    const category =
      entry.getElementsByTagName("category")[0]?.attributes?.getNamedItem("term")?.value ?? "";
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
}
