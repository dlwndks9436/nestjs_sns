import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BasicTokenGuard } from './guard/basic-token.guard';
import { RefreshTokenGuard } from './guard/bearer-token.guard';
import { RegisterUserDto } from './dto/register-user.dto';
import { IsPublic } from 'src/common/decorators/is-public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token/access')
  @IsPublic()
  @UseGuards(RefreshTokenGuard)
  async postTokenAccess(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);

    const newToken = await this.authService.rotateToken(token, false);

    return {
      accessToken: newToken,
    };
  }

  @Post('token/refresh')
  @IsPublic()
  @UseGuards(RefreshTokenGuard)
  async postTokenRefresh(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);

    const newToken = await this.authService.rotateToken(token, true);

    return {
      refreshToken: newToken,
    };
  }

  @Post('login/email')
  @IsPublic()
  @UseGuards(BasicTokenGuard)
  postLoginEmail(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, false);

    const credentials = this.authService.decodeBasicToken(token);
    return this.authService.loginWithEmail(credentials);
  }

  @Post('register/email')
  @IsPublic()
  postRegisterEmail(@Body() body: RegisterUserDto) {
    return this.authService.registerWithEmail(body);
  }
}
