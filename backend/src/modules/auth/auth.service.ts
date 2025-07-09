import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient, UserAccount } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { TokenDto } from './dto/token.dto';
import { UserProfileDto } from './dto/user-profile.dto';

@Injectable()
export class AuthService {
  private prisma = new PrismaClient();

  constructor(private readonly jwtService: JwtService) {}

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
async getProfile(payload: { sub: string; role: string; username?: string }): Promise<UserProfileDto> {
    const userId = Number(payload.sub);
    // storeUsers ではなく、直接 user_account.storeId を取得
    const user = await this.prisma.userAccount.findUnique({
      where: { id: BigInt(userId) },  // Prisma が BigInt を使う場合
      select: {
        id: true,
        username: true,
        role: true,
        storeId: true,  // ここを取得
      },
    });

    if (!user) {
      throw new NotFoundException('ユーザーが見つかりません');
    }

    // owner は全店舗アクセス可（クライアントで解釈）、Manager/staff は単一の storeId
    const allowedStoreIds: number[] =
      payload.role === 'owner'
        ? []
        : user.storeId !== null
        ? [Number(user.storeId)]
        : [];

    return {
      id: user.id.toString(),
      username: user.username,
      role: payload.role as 'owner' | 'manager' | 'staff',
      allowedStoreIds,
    };
  }
}