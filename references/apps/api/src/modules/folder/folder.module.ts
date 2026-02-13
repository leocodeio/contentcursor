import { Module } from '@nestjs/common';
import { FolderService } from './application/services/folder.service';
import { FolderController } from './presentation/controllers/folder.controller';
import { FolderProviders } from './infrastructure/provider/folder.provider';
import { PrismaService } from 'src/utilities/database/prisma.service';
import { DriveModule } from '../media/libs/drive/drive.module';

@Module({
  imports: [DriveModule],
  controllers: [FolderController],
  providers: [PrismaService, FolderService, ...FolderProviders],
  exports: [FolderService],
})
export class FolderModule {}
