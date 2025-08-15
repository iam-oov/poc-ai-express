import { IsString } from 'class-validator';

export class QuestionDto {
  @IsString()
  question: string;
}
