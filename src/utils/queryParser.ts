
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

  // Sort parsing
  if (lowerQuery.includes('most cited') || lowerQuery.includes('popular')) {
    result.sortBy = 'citations';
  } else if (lowerQuery.includes('latest') || lowerQuery.includes('newest') || lowerQuery.includes('recent')) {
    result.sortBy = 'date';
  } else {
    result.sortBy = 'relevance';
  }

  // Create very broad search terms
  const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'that', 'how', 'can', 'any', 'papers', 'paper'];
  
  let words = query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => 
      word.length > 2 && 
      !stopWords.includes(word)
    );

  // Enhanced synonym mapping for better coverage
  const synonymMap: { [key: string]: string[] } = {
    'ai': ['artificial intelligence', 'machine learning', 'ML', 'deep learning', 'neural'],
    'artificial': ['AI', 'machine learning', 'intelligent'],
    'intelligence': ['AI', 'artificial', 'smart', 'cognitive'],
    'economy': ['economic', 'economics', 'financial', 'finance', 'market', 'business'],
    'economic': ['economy', 'economics', 'financial', 'finance', 'market'],
    'impact': ['effect', 'influence', 'consequence', 'affect', 'outcome'],
    'predict': ['prediction', 'forecast', 'anticipate', 'model', 'estimate'],
    'global': ['worldwide', 'international', 'world', 'universal'],
    'learning': ['ML', 'machine learning', 'neural', 'training'],
    'machine': ['ML', 'artificial', 'automated', 'computational']
  };

  // Build comprehensive search terms
  const expandedTerms = new Set(words);
  
  // Add synonyms for each word
  words.forEach(word => {
    if (synonymMap[word]) {
      synonymMap[word].forEach(synonym => expandedTerms.add(synonym));
    }
  });

  // Add common combinations for better results
  if (lowerQuery.includes('ai') && lowerQuery.includes('econom')) {
    expandedTerms.add('computational economics');
    expandedTerms.add('algorithmic trading');
    expandedTerms.add('fintech');
  }

  result.searchTerms = Array.from(expandedTerms).slice(0, 12); // Increased limit

  console.log('Parsed query:', result);
  return result;
};
