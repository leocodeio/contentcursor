import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ITestPort } from '../../domain/ports/test.port';
import { PrismaService } from '../../../../utilities/database/prisma.service';

@Injectable()
export class TestAdapter implements ITestPort {
  constructor(private readonly prismaService: PrismaService) {}

  async getTest(): Promise<any> {
    return this.prismaService.test.findMany();
  }
}
