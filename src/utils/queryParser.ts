
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
  if (lowerQuery.includes('today') || lowerQuery.includes('recent')) {
    const today = new Date();
    result.dateFilter = today.getFullYear().toString();
  } else if (lowerQuery.includes('yesterday')) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    result.dateFilter = yesterday.getFullYear().toString();
  } else if (lowerQuery.includes('this week')) {
    const thisWeek = new Date();
    result.dateFilter = thisWeek.getFullYear().toString();
  } else if (lowerQuery.includes('this month')) {
    const thisMonth = new Date();
    result.dateFilter = thisMonth.getFullYear().toString();
  }

  // Category parsing
  const categoryMappings: Record<string, string> = {
    'ai': 'computer-science',
    'artificial intelligence': 'computer-science',
    'machine learning': 'computer-science',
    'ml': 'computer-science',
    'deep learning': 'computer-science',
    'neural networks': 'computer-science',
    'computer science': 'computer-science',
    'cs': 'computer-science',
    'physics': 'physics',
    'mathematics': 'mathematics',
    'math': 'mathematics',
    'biology': 'biology',
    'bio': 'biology',
    'economics': 'economics',
    'statistics': 'statistics',
    'stats': 'statistics'
  };

  for (const [keyword, category] of Object.entries(categoryMappings)) {
    if (lowerQuery.includes(keyword)) {
      result.category = category;
      break;
    }
  }

  // Sort parsing
  if (lowerQuery.includes('most cited') || lowerQuery.includes('popular')) {
    result.sortBy = 'citations';
  } else if (lowerQuery.includes('latest') || lowerQuery.includes('newest') || lowerQuery.includes('recent')) {
    result.sortBy = 'date';
  } else {
    result.sortBy = 'relevance';
  }

  // Extract search terms (remove common words and parsed terms)
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'around', 'today', 'yesterday', 'recent', 'latest', 'newest', 'published', 'papers', 'paper', 'most', 'cited', 'popular', 'this', 'week', 'month', 'year'];
  
  const words = query.toLowerCase().split(/\s+/).filter(word => 
    word.length > 2 && 
    !commonWords.includes(word) &&
    !Object.keys(categoryMappings).some(keyword => keyword.includes(word) || word.includes(keyword))
  );
  
  result.searchTerms = words;

  return result;
};
