import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from './decorators/roles.decorator';
import { RolesEnum } from './const/roles.const';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(RolesEnum.ADMIN)
  getUsers() {
    return this.usersService.getAllUsers();
  }
}
