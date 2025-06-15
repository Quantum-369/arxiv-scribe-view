
import { ArxivPaper } from "./arxivApi";

export interface SearchState {
  query: string;
  papers: ArxivPaper[];
  currentPage: number;
  totalResults: number;
  totalPages: number;
  resultsPerPage: number;
  filters: {
    category: string;
    year: string;
    author: string;
    sortBy: string;
  };
  hasSearched: boolean;
  timestamp: number;
}

const STORAGE_KEY = 'arxiv_search_state';
const STORAGE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const saveSearchState = (state: Partial<SearchState>) => {
  try {
    const currentState = getSearchState();
    const newState: SearchState = {
      ...currentState,
      ...state,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    console.log('Search state saved:', newState);
  } catch (error) {
    console.error('Failed to save search state:', error);
  }
};

export const getSearchState = (): SearchState => {
  const defaultState: SearchState = {
    query: "",
    papers: [],
    currentPage: 1,
    totalResults: 0,
    totalPages: 1,
    resultsPerPage: 50,
    filters: {
      category: "all",
      year: "",
      author: "",
      sortBy: "date",
    },
    hasSearched: false,
    timestamp: 0,
  };

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultState;

    const state = JSON.parse(stored) as SearchState;
    
    // Check if state is expired
    if (Date.now() - state.timestamp > STORAGE_EXPIRY) {
      clearSearchState();
      return defaultState;
    }

    return state;
  } catch (error) {
    console.error('Failed to get search state:', error);
    return defaultState;
  }
};

export const clearSearchState = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    console.log('Search state cleared');
  } catch (error) {
    console.error('Failed to clear search state:', error);
  }
};

export const isReturningFromPaperView = (): boolean => {
  const state = getSearchState();
  return state.hasSearched && state.papers.length > 0;
};
