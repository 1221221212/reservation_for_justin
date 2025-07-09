// backend/src/modules/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { TokenDto } from './dto/token.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Request } from 'express';
import { UserProfileDto } from './dto/user-profile.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** ログイン */
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<TokenDto> {
    return this.authService.login(loginDto);
  }

  /** 現在のログインユーザー情報を返却 */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: Request): Promise<UserProfileDto> {
    const payload = req.user as { sub: string; role: string; username?: string };
    return this.authService.getProfile(payload);
  }
}
