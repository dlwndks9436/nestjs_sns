import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersModel } from '../entities/users.entity';

export const User = createParamDecorator(
  (data: keyof UsersModel | undefined, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    const user: UsersModel = req.user;

    if (!user) {
      throw new InternalServerErrorException(
        'Request에 user가 존재하지 않습니다.',
      );
    }

    if (data) {
      return user[data];
    }

    return user;
  },
);
