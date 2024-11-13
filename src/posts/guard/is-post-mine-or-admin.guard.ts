import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RolesEnum } from 'src/users/const/roles.const';
import { PostsService } from '../posts.service';
import { Request } from 'express';
import { UsersModel } from 'src/users/entities/users.entity';

@Injectable()
export class IsPostMineOrAdminGuard implements CanActivate {
  constructor(private readonly postService: PostsService) {}

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

    if (!params.postId) {
      throw new BadRequestException('postId가 존재하지 않습니다.');
    }

    const isOk = await this.postService.isPostMine(
      user.id,
      parseInt(params.postId),
    );

    if (!isOk) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    return true;
  }
}
