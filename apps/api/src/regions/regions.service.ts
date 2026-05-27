import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RegionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.region.findMany({
      include: {
        _count: { select: { mountains: true } },
      },
      orderBy: { name: 'asc' },
    });
  }
}
