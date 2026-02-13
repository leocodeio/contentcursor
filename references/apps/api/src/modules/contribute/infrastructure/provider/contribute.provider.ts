import { Provider } from '@nestjs/common';
import { IContributePort } from '../../domain/ports/contribute.port';
import { ContributeRepositoryAdapter } from '../adapters/contribute.repository';

export const ContributeProviders: Provider[] = [
  {
    provide: IContributePort,
    useClass: ContributeRepositoryAdapter,
  },
];
