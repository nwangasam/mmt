import { Module } from "@nestjs/common";
import { BraveSearchProvider } from "./providers/brave-search.provider";
import { SearxngSearchProvider } from "./providers/searxng-search.provider";
import { SearchService } from "./search.service";
import { SEARCH_PROVIDER } from "./search.types";

@Module({
  providers: [
    SearchService,
    BraveSearchProvider,
    SearxngSearchProvider,
    {
      provide: SEARCH_PROVIDER,
      useFactory: (brave: BraveSearchProvider, searxng: SearxngSearchProvider) => {
        return process.env.SEARCH_PROVIDER === "brave" ? brave : searxng;
      },
      inject: [BraveSearchProvider, SearxngSearchProvider]
    }
  ],
  exports: [SearchService]
})
export class SearchModule {}
