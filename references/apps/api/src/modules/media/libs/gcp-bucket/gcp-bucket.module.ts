import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GcpBucketService } from './application/services/gcp-bucket.service';
import { GcpBucketController } from './presentation/controllers/gcp-bucket.controller';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    ConfigModule,
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit for uploads
      },
    }),
  ],
  controllers: [GcpBucketController],
  providers: [GcpBucketService],
  exports: [GcpBucketService],
})
export class GcpBucketModule {}
