import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { RolesEnum } from 'src/users/const/roles.const';
import { UsersModel } from 'src/users/entities/users.entity';
import { CommentsService } from '../comments.service';

@Injectable()
export class IsCommentMineOrAdminGuard implements CanActivate {
  constructor(private readonly commentsService: CommentsService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request & { user: UsersModel } = context
      .switchToHttp()
      .getRequest();

    const { user, params } = req;

    if (!user) {
      throw new UnauthorizedException('인증되지 않은 사용자입니다.');
    }

    if (user.role === RolesEnum.ADMIN) {
      return true;
    }

    const commentId = params.commentId;

    const isOk = await this.commentsService.isCommentMine(
      user.id,
      parseInt(commentId),
    );

    if (!isOk) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    return true;
  }
}
