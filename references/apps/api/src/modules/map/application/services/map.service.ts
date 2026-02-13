import { Injectable } from '@nestjs/common';

// creator editor
import { xCreatorEditorMap } from '../../infrastructure/entities/creator-editor-map.entity';
import { ICreatorEditorMapPort } from '../../domain/ports/creator-editor-map.port';

// account editor
import { xAccountEditorMap } from '../../infrastructure/entities/account-editor-map.entity';
import { IAccountEditorMapPort } from '../../domain/ports/account-editor-map.port';
import { CreatorEditorFindDto } from '../dtos/find-creator-editor.dto';
import { xAccountEditorMapStatusType } from '@spectral/types';

@Injectable()
export class CreatorEditorMapService {
  constructor(private readonly creatorEditorMapPort: ICreatorEditorMapPort) {}

  //
  findMap(
    creatorId: string,
    editorMail: string,
  ): Promise<CreatorEditorFindDto | null> {
    return this.creatorEditorMapPort.findByCreatorIdAndEditorMail(
      creatorId,
      editorMail,
    );
  }

  //
  findMapsByCreatorId(creatorId: string): Promise<xCreatorEditorMap[]> {
    return this.creatorEditorMapPort.findMapsByCreatorId(creatorId);
  }

  // find by editor Id
  findMapsByEditorId(editorId: string): Promise<xCreatorEditorMap[]> {
    return this.creatorEditorMapPort.findByEditorId(editorId);
  }

  //
  requestEditor(
    creatorId: string,
    editorId: string,
  ): Promise<xCreatorEditorMap> {
    return this.creatorEditorMapPort.requestEditor(creatorId, editorId);
  }

  update(
    id: string,
    creatorEditorMap: Partial<xCreatorEditorMap>,
  ): Promise<xCreatorEditorMap | null> {
    return this.creatorEditorMapPort.update(id, creatorEditorMap);
  }
}

@Injectable()
export class AccountEditorMapService {
  constructor(private readonly accountEditorMapPort: IAccountEditorMapPort) {}

  // 0) Get all account editors linked to a creator
  findAccountEditors(
    creatorId: string,
    accountId: string,
  ): Promise<xAccountEditorMap[]> {
    return this.accountEditorMapPort.findByCreatorIdAndAccountId(
      creatorId,
      accountId,
    );
  }

  // 1) Get liked accounts by editorID
  findAccountsByEditorId(editorId: string): Promise<xAccountEditorMap[]> {
    return this.accountEditorMapPort.findByEditorId(editorId);
  }

  // 2) Make a link b/w editor and account (update-status)
  linkEditorToAccount(
    creatorId: string,
    accountId: string,
    editorId: string,
  ): Promise<xAccountEditorMap> {
    return this.accountEditorMapPort.changeCEAstatus(
      creatorId,
      accountId,
      editorId,
      'ACTIVE' as xAccountEditorMapStatusType,
    );
  }

  // 3) Unlink account from editor (update-status to INACTIVE)
  unlinkEditorFromAccount(
    creatorId: string,
    accountId: string,
    editorId: string,
  ): Promise<xAccountEditorMap | null> {
    return this.accountEditorMapPort.changeCEAstatus(
      creatorId,
      accountId,
      editorId,
      'INACTIVE' as xAccountEditorMapStatusType,
    );
  }
}
