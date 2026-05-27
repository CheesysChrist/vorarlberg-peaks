import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { MountainsService } from './mountains.service';
import { MountainsQueryDto } from './dto/mountains-query.dto';
import { OptionalJwtGuard } from '../auth/guards/optional-jwt.guard';
import type { AuthUser } from '../auth/types';

@ApiTags('mountains')
@Controller('mountains')
export class MountainsController {
  constructor(private readonly mountainsService: MountainsService) {}

  @Get()
  @UseGuards(OptionalJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all mountains with optional hike status' })
  findAll(@Query() query: MountainsQueryDto, @Req() req: any) {
    const user = (req as any).user as AuthUser | undefined;
    return this.mountainsService.findAll(query, user?.id);
  }

  @Get(':id')
  @UseGuards(OptionalJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get mountain details' })
  findOne(@Param('id') id: string, @Req() req: any) {
    const user = (req as any).user as AuthUser | undefined;
    return this.mountainsService.findOne(id, user?.id);
  }
}
