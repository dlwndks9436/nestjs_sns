import { IsNumber } from 'class-validator';

export class CreateChatDto {
  @IsNumber(undefined, { each: true })
  userIds: number[];
}
