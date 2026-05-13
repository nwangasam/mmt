import { Type } from "class-transformer";
import { IsObject, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";

export class TriviaOptionsDto {
  @IsString()
  @MaxLength(180)
  A!: string;

  @IsString()
  @MaxLength(180)
  B!: string;
}

export class AnswerTriviaDto {
  @IsString()
  @MaxLength(500)
  question!: string;

  @IsObject()
  @ValidateNested()
  @Type(() => TriviaOptionsDto)
  options!: TriviaOptionsDto;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  idempotencyKey?: string;
}
