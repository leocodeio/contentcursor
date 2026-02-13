import { GetCreatorEntryModel } from '../enums/get-creator-entry.model';
import { IYtCreatorEntity } from '../models/yt-creator.model';

export abstract class IYtCreatorPort {
  abstract find(
    query: GetCreatorEntryModel,
  ): Promise<Partial<IYtCreatorEntity>[]>;
  abstract findByEmail(email: string): Promise<IYtCreatorEntity | null>;
  abstract findById(id: string): Promise<IYtCreatorEntity | null>;
  abstract save(preferences: IYtCreatorEntity): Promise<IYtCreatorEntity>;
  abstract delete(id: string): Promise<void>;
}
