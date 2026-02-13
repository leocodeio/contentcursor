import { Module } from '@nestjs/common';
import { MediaService } from './application/services/media.service';
import { MediaController } from './presentation/controllers/media.controller';
import { PrismaService } from 'src/utilities/database/prisma.service';
import { MediaProviders } from './infrastructure/provider/media.provider';
import { DriveService } from '../../libs/drive/application/services/drive.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [MediaController],
  providers: [DriveService, PrismaService, MediaService, ...MediaProviders],
  exports: [MediaService],
})
export class MediaModule {}
