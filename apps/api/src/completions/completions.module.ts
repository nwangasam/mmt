import { Module } from "@nestjs/common";
import { TriviaModule } from "../trivia/trivia.module";
import { CompletionsController } from "./completions.controller";

@Module({
  imports: [TriviaModule],
  controllers: [CompletionsController]
})
export class CompletionsModule {}
