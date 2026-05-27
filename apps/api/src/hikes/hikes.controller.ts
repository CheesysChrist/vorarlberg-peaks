import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { HikesService } from './hikes.service';
import { CreateHikeDto } from './dto/create-hike.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthUser } from '../auth/types';

@ApiTags('hikes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hikes')
export class HikesController {
  constructor(private readonly hikesService: HikesService) {}

  @Post()
  @ApiOperation({ summary: 'Log or update a hike' })
  create(@Body() dto: CreateHikeDto, @Req() req: any) {
    const user = (req as any).user as AuthUser;
    return this.hikesService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all hikes for the authenticated user' })
  findAll(@Req() req: any) {
    const user = (req as any).user as AuthUser;
    return this.hikesService.findAllByUser(user.id);
  }

  @Delete(':mountainId')
  @ApiOperation({ summary: 'Remove a hike log entry' })
  remove(@Param('mountainId') mountainId: string, @Req() req: any) {
    const user = (req as any).user as AuthUser;
    return this.hikesService.remove(user.id, mountainId);
  }
}
