// backend/src/modules/user/user.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma-client/prisma.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [PrismaModule],  // PrismaService を共有
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}