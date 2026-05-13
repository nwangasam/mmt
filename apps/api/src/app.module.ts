import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "./auth/auth.module";
import { CacheModule } from "./cache/cache.module";
import { CompletionsModule } from "./completions/completions.module";
import { HealthModule } from "./health/health.module";
import { LlmModule } from "./llm/llm.module";
import { SearchModule } from "./search/search.module";
import { TriviaModule } from "./trivia/trivia.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120
      }
    ]),
    AuthModule,
    CacheModule,
    HealthModule,
    SearchModule,
    LlmModule,
    TriviaModule,
    CompletionsModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}
