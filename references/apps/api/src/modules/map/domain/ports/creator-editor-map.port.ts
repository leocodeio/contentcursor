import { xCreatorEditorMap } from '../../infrastructure/entities/creator-editor-map.entity';
import { CreatorEditorFindDto } from '../../application/dtos/find-creator-editor.dto';

export abstract class ICreatorEditorMapPort {
  abstract findMapsByCreatorId(creatorId: string): Promise<xCreatorEditorMap[]>;
  abstract findByEditorId(editorId: string): Promise<xCreatorEditorMap[]>;
  abstract findByCreatorIdAndEditorMail(
    creatorId: string,
    editorMail: string,
  ): Promise<CreatorEditorFindDto | null>;
  abstract requestEditor(
    creatorId: string,
    editorId: string,
  ): Promise<xCreatorEditorMap>;
  abstract update(
    id: string,
    map: Partial<xCreatorEditorMap>,
  ): Promise<xCreatorEditorMap | null>;
}
