import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { DriveService } from './application/services/drive.service';
import { DriveController } from './presentation/controllers/drive.controller';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    MulterModule.register({
      limits: {
        fileSize: 1000 * 1024 * 1024, // 1000MB limit for uploads
      },
    }),
  ],
  controllers: [DriveController],
  providers: [DriveService],
  exports: [DriveService],
})
export class DriveModule {}
