import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MountainsQueryDto } from './dto/mountains-query.dto';

@Injectable()
export class MountainsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: MountainsQueryDto, userId?: string) {
    const { regionId, difficulty, search, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.MountainWhereInput = {
      ...(regionId && { regionId }),
      ...(difficulty && { difficulty }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { nameDe: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [mountains, total] = await Promise.all([
      this.prisma.mountain.findMany({
        where,
        include: {
          region: true,
          ...(userId && { hikes: { where: { userId }, select: { hikedAt: true } } }),
        },
        skip,
        take: limit,
        orderBy: { altitude: 'desc' },
      }),
      this.prisma.mountain.count({ where }),
    ]);

    const data = mountains.map((m) => {
      const { hikes, ...mountain } = m as typeof m & { hikes?: { hikedAt: Date }[] };
      return {
        ...mountain,
        hiked: hikes ? hikes.length > 0 : false,
        hikedAt: hikes?.[0]?.hikedAt ?? null,
      };
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  findOne(id: string, userId?: string) {
    return this.prisma.mountain.findUniqueOrThrow({
      where: { id },
      include: {
        region: true,
        ...(userId && { hikes: { where: { userId }, select: { hikedAt: true, notes: true, rating: true } } }),
      },
    });
  }
}
