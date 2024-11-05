import { IsNumber } from 'class-validator';

export class EnterChatDto {
  @IsNumber(undefined, { each: true })
  chatIds: number[];
}
