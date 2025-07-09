import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
} from '@nestjs/common';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '@prisma/client';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    /** 全ユーザー一覧取得（オーナーのみ） */
    @Get()
    @Auth({ roles: [Role.owner] })
    async findAll() {
        return this.userService.findAll();
    }

    /** 新規ユーザー作成（オーナーのみ） */
    @Post()
    @Auth({ roles: [Role.owner] })
    async create(@Body() dto: CreateUserDto) {
        return this.userService.create(dto);
    }

    /** ユーザー更新（オーナーのみ） */
    @Put(':id')
    @Auth({ roles: [Role.owner] })
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateUserDto,
    ) {
        return this.userService.update(id, dto);
    }

    /** ユーザー非アクティブ化（オーナーのみ） */
    @Delete(':id')
    @Auth({ roles: [Role.owner] })
    async remove(@Param('id') id: string) {
        return this.userService.remove(id);
    }
}
