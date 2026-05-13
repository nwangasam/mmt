import { Module } from "@nestjs/common";
import { LlmModule } from "../llm/llm.module";
import { SearchModule } from "../search/search.module";
import { TriviaController } from "./trivia.controller";
import { TriviaService } from "./trivia.service";

@Module({
  imports: [SearchModule, LlmModule],
  controllers: [TriviaController],
  providers: [TriviaService],
  exports: [TriviaService]
})
export class TriviaModule {}
