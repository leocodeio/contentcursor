import { Module } from '@nestjs/common';

// creator editor map
import { CreatorEditorMapService } from './application/services/map.service';
import { CreatorEditorMapController } from './presentation/controllers/map.controller';
import { ICreatorEditorMapPort } from './domain/ports/creator-editor-map.port';
import { CreatorEditorMapRepositoryAdapter } from './infrastructure/adapters/map.repository';

// account editor map
import { AccountEditorMapService } from './application/services/map.service';
import { AccountEditorMapController } from './presentation/controllers/map.controller';
import { IAccountEditorMapPort } from './domain/ports/account-editor-map.port';
import { AccountEditorMapRepositoryAdapter } from './infrastructure/adapters/map.repository';
import { PrismaService } from 'src/utilities/database/prisma.service';
import { mapProvider } from './infrastructure/provider/map.provider';

@Module({
  imports: [],
  controllers: [CreatorEditorMapController, AccountEditorMapController],
  providers: [
    PrismaService,
    // creator editor map
    CreatorEditorMapService,
    ...mapProvider,
  ],
})
export class MapModule {}
