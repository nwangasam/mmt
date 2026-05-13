import { Inject, Injectable } from "@nestjs/common";
import { CacheService } from "../cache/cache.service";
import { SearchProvider, SearchResult, SEARCH_PROVIDER } from "./search.types";

@Injectable()
export class SearchService {
  constructor(
    @Inject(SEARCH_PROVIDER) private readonly provider: SearchProvider,
    private readonly cache: CacheService
  ) {}

  async search(query: string, limit: number): Promise<SearchResult[]> {
    const key = `search:${this.hash(`${query}:${limit}`)}`;
    const cached = await this.cache.getJson<SearchResult[]>(key);
    if (cached) {
      return cached;
    }

    const results = await this.provider.search({ query, limit });
    const compacted = this.compact(results, limit);
    await this.cache.setJson(key, compacted, 2_592_000);
    return compacted;
  }

  private compact(results: SearchResult[], limit: number): SearchResult[] {
    const seen = new Set<string>();
    return results
      .map((result) => ({
        ...result,
        title: this.truncate(result.title, 120),
        snippet: this.truncate(result.snippet.replace(/\s+/g, " "), 260)
      }))
      .filter((result) => {
        const normalizedUrl = result.url.replace(/[#?].*$/, "");
        if (seen.has(normalizedUrl)) {
          return false;
        }
        seen.add(normalizedUrl);
        return true;
      })
      .slice(0, limit);
  }

  private truncate(value: string, maxLength: number): string {
    return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1)}...`;
  }

  private hash(value: string): string {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(index);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }
}
