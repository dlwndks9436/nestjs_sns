import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { PaginateCommentsDto } from './dto/paginate-comments.dto';
import { CreateCommentsDto } from './dto/create-comments.dto';
import { User } from 'src/users/decorators/user.decorator';
import { UsersModel } from 'src/users/entities/users.entity';
import { UpdateCommentsDto } from './dto/update-comments.dto';
import { IsPublic } from 'src/common/decorators/is-public.decorator';
import { IsCommentMineOrAdminGuard } from './guard/is-comment-mine-or-admin.guard';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { QueryRunner } from 'typeorm';
import { PostsService } from '../posts.service';
import { QR } from 'src/common/decorators/query-runner.decorator';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly postsService: PostsService,
  ) {}

  @Get()
  @IsPublic()
  getComments(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() query: PaginateCommentsDto,
  ) {
    return this.commentsService.paginateComments(query, postId);
  }

  @Get(':commentId')
  @IsPublic()
  getComment(@Param('commentId', ParseIntPipe) commentId: number) {
    return this.commentsService.getCommentById(commentId);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  async postComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() body: CreateCommentsDto,
    @User() user: UsersModel,
    @QR() qr: QueryRunner,
  ) {
    const comment = await this.commentsService.createComment(
      body,
      postId,
      user,
      qr,
    );

    await this.postsService.incrementCommentCount(postId, qr);

    return comment;
  }

  @Patch(':commentId')
  @UseGuards(IsCommentMineOrAdminGuard)
  async patchComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() dto: UpdateCommentsDto,
  ) {
    return this.commentsService.updateComment(dto, commentId);
  }

  @Delete(':commentId')
  @UseGuards(IsCommentMineOrAdminGuard)
  @UseInterceptors(TransactionInterceptor)
  async deleteComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @QR() qr: QueryRunner,
  ) {
    const result = await this.commentsService.deleteComment(commentId, qr);

    await this.postsService.decrementCommentCount(postId, qr);

    return result;
  }
}
