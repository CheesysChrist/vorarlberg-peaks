import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHikeDto } from './dto/create-hike.dto';

@Injectable()
export class HikesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateHikeDto) {
    const mountain = await this.prisma.mountain.findUnique({ where: { id: dto.mountainId } });
    if (!mountain) throw new NotFoundException('Mountain not found');

    return this.prisma.hike.upsert({
      where: { userId_mountainId: { userId, mountainId: dto.mountainId } },
      create: { userId, mountainId: dto.mountainId, hikedAt: new Date(dto.hikedAt), notes: dto.notes, rating: dto.rating },
      update: { hikedAt: new Date(dto.hikedAt), notes: dto.notes, rating: dto.rating },
      include: { mountain: { include: { region: true } } },
    });
  }

  findAllByUser(userId: string) {
    return this.prisma.hike.findMany({
      where: { userId },
      include: { mountain: { include: { region: true } } },
      orderBy: { hikedAt: 'desc' },
    });
  }

  async remove(userId: string, mountainId: string) {
    const hike = await this.prisma.hike.findUnique({
      where: { userId_mountainId: { userId, mountainId } },
    });
    if (!hike) throw new NotFoundException('Hike not found');
    return this.prisma.hike.delete({ where: { userId_mountainId: { userId, mountainId } } });
  }
}
