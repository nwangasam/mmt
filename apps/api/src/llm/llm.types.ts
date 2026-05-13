export interface TriviaCompletionInput {
  question: string;
  options: {
    A: string;
    B: string;
  };
  evidence: Array<{
    title: string;
    snippet: string;
    source: string;
    url: string;
  }>;
}

export interface TriviaCompletionOutput {
  answer: "A" | "B";
  confidence: number;
  reason?: string;
}
