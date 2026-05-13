import { SearchResult } from "../search/search.types";

export interface TriviaAnswer {
  answer: "A" | "B";
  confidence: number;
  reason?: string;
  sources: SearchResult[];
  cached: boolean;
}
