import { Provider } from '@nestjs/common';
import { IMediaPort } from '../../domain/ports/media.port';
import { MediaRepositoryAdapter } from '../adapters/media.repository';

export const MediaProviders: Provider[] = [
  {
    provide: IMediaPort,
    useClass: MediaRepositoryAdapter,
  },
];
