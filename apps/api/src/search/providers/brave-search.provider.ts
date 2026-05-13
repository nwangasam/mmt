import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SearchInput, SearchProvider, SearchResult } from "../search.types";

interface BraveWebResult {
  title?: string;
  url?: string;
  description?: string;
  profile?: {
    name?: string;
  };
}

interface BraveSearchResponse {
  web?: {
    results?: BraveWebResult[];
  };
}

@Injectable()
export class BraveSearchProvider implements SearchProvider {
  constructor(private readonly config: ConfigService) {}

  async search(input: SearchInput): Promise<SearchResult[]> {
    const apiKey = this.config.get<string>("BRAVE_SEARCH_API_KEY");
    if (!apiKey) {
      throw new ServiceUnavailableException("BRAVE_SEARCH_API_KEY is not configured");
    }

    const params = new URLSearchParams({
      q: input.query,
      count: String(input.limit),
      search_lang: "en",
      country: "US",
      safesearch: "moderate"
    });

    const response = await fetch(`https://api.search.brave.com/res/v1/web/search?${params}`, {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": apiKey
      },
      signal: AbortSignal.timeout(8_000)
    });

    if (!response.ok) {
      throw new ServiceUnavailableException(`Brave Search failed with ${response.status}`);
    }

    const body = (await response.json()) as BraveSearchResponse;
    return (body.web?.results ?? [])
      .filter((result) => result.title && result.url && result.description)
      .map((result) => ({
        title: result.title ?? "",
        url: result.url ?? "",
        snippet: result.description ?? "",
        source: result.profile?.name ?? this.hostname(result.url ?? "")
      }));
  }

  private hostname(url: string): string {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return "unknown";
    }
  }
}
