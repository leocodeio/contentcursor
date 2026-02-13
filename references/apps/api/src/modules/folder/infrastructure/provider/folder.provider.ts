import { Provider } from '@nestjs/common';
import { IFolderPort } from '../../domain/ports/folder.port';
import { FolderRepositoryAdapter } from '../adapters/folder.repository';

export const FolderProviders: Provider[] = [
  {
    provide: IFolderPort,
    useClass: FolderRepositoryAdapter,
  },
];
