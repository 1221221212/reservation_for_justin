import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma-client/prisma.service';
import { UserAccount } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { TokenDto } from './dto/token.dto';
import { UserProfileDto } from './dto/user-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  /** ユーザー認証 */
  async validateUser(loginDto: LoginDto): Promise<UserAccount> {
    const { userId, password } = loginDto;
    const user = await this.prisma.userAccount.findUnique({
      where: { userId },
    });
    if (!user) {
      throw new UnauthorizedException('ユーザーが存在しません');
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      throw new UnauthorizedException('パスワードが不正です');
    }
    return user;
  }

  /** ログイン -> JWT 発行 */
  async login(loginDto: LoginDto): Promise<TokenDto> {
    const user = await this.validateUser(loginDto);
    const payload = {
      sub: user.id.toString(),
      role: user.role,
      username: user.username,
    };
    const accessToken = this.jwtService.sign(payload);
    const decoded = this.jwtService.decode(accessToken) as { exp: number; iat: number };
    return {
      accessToken,
      expiresIn: decoded.exp - decoded.iat,
    };
  }

  /**
   * JWT ペイロードをもとに、ユーザー情報＋店舗許可リストを取得して返却
   */
  async getProfile(
    payload: { sub: string; role: string; username?: string },
  ): Promise<UserProfileDto> {
    const userId = Number(payload.sub);
    const user = await this.prisma.userAccount.findUnique({
      where: { id: BigInt(userId) },
      select: {
        id: true,
        username: true,
        role: true,
        storeId: true,
      },
    });
    if (!user) {
      throw new NotFoundException('ユーザーが見つかりません');
    }

    const allowedStoreIds: number[] =
      payload.role === 'OIWNER'
        ? []
        : user.storeId !== null
        ? [Number(user.storeId)]
        : [];

    return {
      id: user.id.toString(),
      username: user.username,
      role: payload.role as 'OWNER' | 'MANAGER' | 'STAFF',
      allowedStoreIds,
    };
  }
}