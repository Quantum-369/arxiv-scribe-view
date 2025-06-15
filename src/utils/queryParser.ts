export interface ParsedQuery {
  searchTerms: string[];
  category?: string;
  dateFilter?: string;
  sortBy?: string;
}

export const parseNaturalLanguageQuery = (query: string): ParsedQuery => {
  const lowerQuery = query.toLowerCase();
  const result: ParsedQuery = {
    searchTerms: [],
  };

  // Date parsing
  if (lowerQuery.includes('recent') || lowerQuery.includes('latest') || lowerQuery.includes('new')) {
    const currentYear = new Date().getFullYear();
    result.dateFilter = currentYear.toString();
  }

  // Extract year mentions (2020, 2021, etc.)
  const yearMatch = query.match(/\b(20[0-2][0-9])\b/);
  if (yearMatch) {
    result.dateFilter = yearMatch[1];
  }

  // Remove category detection completely - it's too restrictive
  // Let the search be broad across all categories

  // Sort parsing
  if (lowerQuery.includes('most cited') || lowerQuery.includes('popular')) {
    result.sortBy = 'citations';
  } else if (lowerQuery.includes('latest') || lowerQuery.includes('newest') || lowerQuery.includes('recent')) {
    result.sortBy = 'date';
  } else {
    result.sortBy = 'relevance';
  }

  // Much more permissive search term extraction
  const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'papers', 'paper', 'that', 'how', 'can', 'any'];
  
  const words = query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .split(/\s+/)
    .filter(word => 
      word.length > 2 && 
      !stopWords.includes(word)
    );

  // Keep more search terms and add synonyms for key concepts
  result.searchTerms = words.slice(0, 8); // Increased from 5 to 8

  // Add synonyms for common concepts
  const synonymMap: { [key: string]: string[] } = {
    'ai': ['artificial intelligence', 'machine learning', 'ML'],
    'artificial': ['AI', 'machine learning'],
    'intelligence': ['AI', 'artificial'],
    'economy': ['economic', 'economics', 'financial'],
    'economic': ['economy', 'economics', 'financial'],
    'impact': ['effect', 'influence', 'consequence'],
    'predict': ['prediction', 'forecast', 'anticipate'],
    'global': ['worldwide', 'international', 'world']
  };

  // Add synonyms to search terms
  const expandedTerms = [...result.searchTerms];
  result.searchTerms.forEach(term => {
    if (synonymMap[term]) {
      expandedTerms.push(...synonymMap[term]);
    }
  });

  result.searchTerms = [...new Set(expandedTerms)].slice(0, 10); // Remove duplicates and limit

  return result;
};
