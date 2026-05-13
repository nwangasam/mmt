import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiKeyGuard } from "../auth/api-key.guard";
import { AnswerTriviaDto } from "./dto/answer-trivia.dto";
import { TriviaService } from "./trivia.service";

@UseGuards(ApiKeyGuard)
@Controller("v1/trivia")
export class TriviaController {
  constructor(private readonly trivia: TriviaService) {}

  @Post("answer")
  answer(@Body() body: AnswerTriviaDto) {
    return this.trivia.answer(body);
  }
}
