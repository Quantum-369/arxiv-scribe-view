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

  // Much simpler category detection - only for very specific terms
  if (lowerQuery.includes('computer science') || lowerQuery.includes('cs.')) {
    result.category = 'cs';
  } else if (lowerQuery.includes('physics') && !lowerQuery.includes('bio')) {
    result.category = 'physics';
  } else if (lowerQuery.includes('mathematics') || lowerQuery.includes('math.')) {
    result.category = 'math';
  }

  // Sort parsing
  if (lowerQuery.includes('most cited') || lowerQuery.includes('popular')) {
    result.sortBy = 'citations';
  } else if (lowerQuery.includes('latest') || lowerQuery.includes('newest') || lowerQuery.includes('recent')) {
    result.sortBy = 'date';
  } else {
    result.sortBy = 'relevance';
  }

  // Much more permissive search term extraction
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'papers', 'paper'];
  
  const words = query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .split(/\s+/)
    .filter(word => 
      word.length > 2 && 
      !commonWords.includes(word)
    );

  // Keep most words as search terms - be much less aggressive in filtering
  result.searchTerms = words.slice(0, 5); // Limit to 5 terms max for better results

  return result;
};
