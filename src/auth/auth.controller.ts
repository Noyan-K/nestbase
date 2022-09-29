import { Controller, Post, Body, UseGuards, Res, Req } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Tokens } from './types/tokens.type';
import {
  GetCurrentUserId,
  GetCurrentUser,
  Public,
} from 'src/common/decorators';
import { RefreshTokenGuard } from 'src/common/guards';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/registration')
  registration(@Body() createUserDto: CreateUserDto): Promise<Tokens> {
    return this.authService.registration(createUserDto);
  }

  @Public()
  @Post('/login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Tokens> {
    const tokens = await this.authService.login(loginDto);
    res.cookie('auth-cookie', tokens.refreshToken, { httpOnly: true });
    return tokens;
  }

  @Post('/logout')
  logout(@GetCurrentUserId() userId: number): Promise<object> {
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('/refresh')
  refresh(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    return this.authService.refresh(userId, refreshToken);
  }
}
