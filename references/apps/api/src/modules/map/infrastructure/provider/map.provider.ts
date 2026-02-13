import { AccountEditorMapService } from '../../application/services/map.service';
import { IAccountEditorMapPort } from '../../domain/ports/account-editor-map.port';
import { ICreatorEditorMapPort } from '../../domain/ports/creator-editor-map.port';
import {
  AccountEditorMapRepositoryAdapter,
  CreatorEditorMapRepositoryAdapter,
} from '../adapters/map.repository';

export const mapProvider = [
  {
    provide: ICreatorEditorMapPort,
    useClass: CreatorEditorMapRepositoryAdapter,
  },
  AccountEditorMapService,
  {
    provide: IAccountEditorMapPort,
    useClass: AccountEditorMapRepositoryAdapter,
  },
];
