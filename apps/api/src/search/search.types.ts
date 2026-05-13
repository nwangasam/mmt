export interface SearchInput {
  query: string;
  limit: number;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export interface SearchProvider {
  search(input: SearchInput): Promise<SearchResult[]>;
}

export const SEARCH_PROVIDER = Symbol("SEARCH_PROVIDER");
