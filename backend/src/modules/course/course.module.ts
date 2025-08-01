import { Module } from '@nestjs/common';
import { PrismaService } from '@/prisma-client/prisma.service';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { CourseScheduleService } from './course-schedule.service';

@Module({
    imports: [],
    controllers: [CourseController],
    providers: [
        PrismaService,
        CourseService,
        CourseScheduleService,
    ],
})
export class CourseModule { }
