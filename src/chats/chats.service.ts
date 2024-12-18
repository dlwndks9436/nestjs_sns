import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatsModel } from './entities/chats.entity';
import { Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { PaginateChatDto } from './dto/paginate-chat.dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatsModel)
    private readonly chatsRepository: Repository<ChatsModel>,
    private readonly commonService: CommonService,
  ) {}

  paginateChats(dto: PaginateChatDto) {
    return this.commonService.paginate(
      dto,
      this.chatsRepository,
      {
        relations: {
          users: true,
        },
      },
      'chats',
    );
  }

  async createChat(userIds: number[]) {
    const chat = await this.chatsRepository.save({
      users: userIds.map((id) => ({ id })),
    });

    return this.chatsRepository.findOne({
      where: {
        id: chat.id,
      },
    });
  }

  async checkIfChatExists(chatId: number) {
    const exists = await this.chatsRepository.exists({
      where: {
        id: chatId,
      },
    });

    return exists;
  }
}
