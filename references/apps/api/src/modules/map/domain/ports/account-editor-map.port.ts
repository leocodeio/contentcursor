import { xAccountEditorMap } from '../../infrastructure/entities/account-editor-map.entity';
import { xAccountEditorMapStatusType } from '@spectral/types';

export abstract class IAccountEditorMapPort {
  abstract findByAccountId(accountId: string): Promise<xAccountEditorMap[]>;
  abstract findByEditorId(editorId: string): Promise<xAccountEditorMap[]>;
  abstract findByCreatorIdAndAccountId(
    creatorId: string,
    accountId: string,
  ): Promise<xAccountEditorMap[]>;
  abstract changeCEAstatus(
    creatorId: string,
    accountId: string,
    editorId: string,
    status: xAccountEditorMapStatusType,
  ): Promise<xAccountEditorMap>;
  abstract update(
    id: string,
    map: Partial<xAccountEditorMap>,
  ): Promise<xAccountEditorMap | null>;
}
