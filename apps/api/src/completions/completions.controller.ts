import { BadRequestException, Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiKeyGuard } from "../auth/api-key.guard";
import { TriviaService } from "../trivia/trivia.service";
import { ChatCompletionDto } from "./dto/chat-completion.dto";

@UseGuards(ApiKeyGuard)
@Controller("v1/chat")
export class CompletionsController {
  constructor(private readonly trivia: TriviaService) {}

  @Post("completions")
  async complete(@Body() body: ChatCompletionDto) {
    if (body.stream) {
      throw new BadRequestException("Streaming is not supported yet");
    }

    const parsed = this.parseTriviaPrompt(body.messages.at(-1)?.content ?? "");
    const result = await this.trivia.answer(parsed);
    const created = Math.floor(Date.now() / 1000);

    return {
      id: `chatcmpl_mmt_${created}`,
      object: "chat.completion",
      created,
      model: body.model,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: result.answer
          },
          finish_reason: "stop"
        }
      ],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 1,
        total_tokens: 1
      },
      mmt: {
        confidence: result.confidence,
        cached: result.cached,
        sources: result.sources
      }
    };
  }

  private parseTriviaPrompt(content: string) {
    const question = this.match(content, /question\s*:\s*(.+?)(?:\n|$)/i);
    const optionA = this.match(content, /\bA\s*:\s*(.+?)(?:\n|$)/i);
    const optionB = this.match(content, /\bB\s*:\s*(.+?)(?:\n|$)/i);

    if (!question || !optionA || !optionB) {
      throw new BadRequestException("Prompt must include Question:, A:, and B: lines");
    }

    return {
      question,
      options: {
        A: optionA,
        B: optionB
      }
    };
  }

  private match(content: string, regex: RegExp): string | undefined {
    return regex.exec(content)?.[1]?.trim();
  }
}
