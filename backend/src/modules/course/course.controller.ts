import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody,
    ApiQuery,
} from '@nestjs/swagger';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseResponseDto } from './dto/course-response.dto';
import { CourseMonthlyAvailabilityResponseDto } from './dto/course-monthly-availability.dto';
import { AvailableCoursesResponseDto } from './dto/available-courses-response.dto';
import { CreateSpecialCourseScheduleGroupDto } from './dto/create-special-course-schedule-group.dto';

@ApiTags('courses')
@Controller('stores/:storeId/courses')
export class CourseController {
    constructor(private readonly courseService: CourseService) {}

    @Get()
    @ApiOperation({ summary: 'コース一覧取得' })
    @ApiParam({ name: 'storeId', description: '店舗ID', type: Number })
    @ApiResponse({ status: 200, type: [CourseResponseDto] })
    async findAll(
        @Param('storeId', ParseIntPipe) storeId: number,
    ): Promise<CourseResponseDto[]> {
        return this.courseService.findAll(storeId);
    }

    @Get(':courseId')
    @ApiOperation({ summary: 'コース詳細取得' })
    @ApiParam({ name: 'storeId', description: '店舗ID', type: Number })
    @ApiParam({ name: 'courseId', description: 'コースID', type: Number })
    @ApiResponse({ status: 200, type: CourseResponseDto })
    async findOne(
        @Param('storeId', ParseIntPipe) storeId: number,
        @Param('courseId', ParseIntPipe) courseId: number,
    ): Promise<CourseResponseDto> {
        return this.courseService.findOne(storeId, courseId);
    }

    @Post()
    @ApiOperation({ summary: 'コース作成' })
    @ApiParam({ name: 'storeId', description: '店舗ID', type: Number })
    @ApiBody({ type: CreateCourseDto })
    @ApiResponse({ status: 201, type: CourseResponseDto })
    async create(
        @Param('storeId', ParseIntPipe) storeId: number,
        @Body() dto: CreateCourseDto,
    ): Promise<CourseResponseDto> {
        return this.courseService.create(storeId, dto);
    }

    @Patch(':courseId')
    @ApiOperation({ summary: 'コース更新' })
    @ApiParam({ name: 'storeId', description: '店舗ID', type: Number })
    @ApiParam({ name: 'courseId', description: 'コースID', type: Number })
    @ApiBody({ type: UpdateCourseDto })
    @ApiResponse({ status: 200, type: CourseResponseDto })
    async update(
        @Param('storeId', ParseIntPipe) storeId: number,
        @Param('courseId', ParseIntPipe) courseId: number,
        @Body() dto: UpdateCourseDto,
    ): Promise<CourseResponseDto> {
        return this.courseService.update(storeId, courseId, dto);
    }

    @Delete(':courseId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'コース削除（論理）' })
    @ApiParam({ name: 'storeId', description: '店舗ID', type: Number })
    @ApiParam({ name: 'courseId', description: 'コースID', type: Number })
    async remove(
        @Param('storeId', ParseIntPipe) storeId: number,
        @Param('courseId', ParseIntPipe) courseId: number,
    ): Promise<void> {
        return this.courseService.remove(storeId, courseId);
    }

    // ───────────────────────────────────────────────────────────
    // 月次可用性取得 API
    @Get(':courseId/availability/monthly')
    @ApiOperation({ summary: 'コースの月次可用性取得' })
    @ApiParam({ name: 'storeId', description: '店舗ID', type: Number })
    @ApiParam({ name: 'courseId', description: 'コースID', type: Number })
    @ApiQuery({ name: 'year', description: '対象年 (YYYY)', example: '2025' })
    @ApiQuery({ name: 'month', description: '対象月 (MM)', example: '08' })
    @ApiResponse({ status: 200, type: CourseMonthlyAvailabilityResponseDto })
    async getMonthlyAvailability(
        @Param('storeId', ParseIntPipe) storeId: number,
        @Param('courseId', ParseIntPipe) courseId: number,
        @Query('year', ParseIntPipe) year: number,
        @Query('month', ParseIntPipe) month: number,
    ): Promise<CourseMonthlyAvailabilityResponseDto> {
        return this.courseService.getMonthlyAvailability(
            storeId,
            courseId,
            year,
            month,
        );
    }

    // ───────────────────────────────────────────────────────────
    // 日時指定・人数指定可用性検索 API
    @Get('availability')
    @ApiOperation({ summary: '指定日時・人数で利用可能なコース一覧取得' })
    @ApiParam({ name: 'storeId', description: '店舗ID', type: Number })
    @ApiQuery({ name: 'date', description: '対象日 (YYYY-MM-DD)', example: '2025-08-15' })
    @ApiQuery({ name: 'time', description: '対象時刻 (HH:mm)',    example: '19:30' })
    @ApiQuery({ name: 'count', description: '予約人数',             example: 2, required: false })
    @ApiResponse({ status: 200, type: AvailableCoursesResponseDto })
    async findAvailableCourses(
        @Param('storeId', ParseIntPipe) storeId: number,
        @Query('date') date: string,
        @Query('time') time: string,
        @Query('count', ParseIntPipe) count?: number,
    ): Promise<AvailableCoursesResponseDto> {
        return this.courseService.findAvailableCourses(storeId, date, time, count);
    }

    /**
     * 特別日のスケジュールを作成
     */
    @Post(':courseId/special')
    @ApiOperation({ summary: '特別日のスケジュールを作成' })
    @ApiParam({ name: 'storeId', description: '店舗ID', type: Number })
    @ApiParam({ name: 'courseId', description: 'コースID', type: Number })
    @ApiBody({ type: CreateSpecialCourseScheduleGroupDto })
    @ApiResponse({ status: 201 })
    async createSpecial(
        @Param('storeId', ParseIntPipe) storeId: number,
        @Param('courseId', ParseIntPipe) courseId: number,
        @Body() dto: CreateSpecialCourseScheduleGroupDto,
    ): Promise<void> {
        await this.courseService.createSpecialCourseScheduleGroup(storeId, courseId, dto);
    }
}
