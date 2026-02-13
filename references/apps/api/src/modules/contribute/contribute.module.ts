import { Module } from '@nestjs/common';
import { ContributeService } from './application/services/contribute.service';
import { ContributeController } from './presentation/controllers/contribute.controller';
import { ContributeProviders } from './infrastructure/provider/contribute.provider';
import { PrismaService } from 'src/utilities/database/prisma.service';
import { MediaModule } from '../media/modules/media/media.module';
import { YtAuthModule } from '../yt_int/modules/youtube/yt-auth.module';
import { YtCreatorModule } from '../yt_int/modules/creator/yt-creator.module';

@Module({
  imports: [MediaModule, YtAuthModule, YtCreatorModule],
  controllers: [ContributeController],

  providers: [PrismaService, ContributeService, ...ContributeProviders],
  exports: [ContributeService],
})
export class ContributeModule {}
