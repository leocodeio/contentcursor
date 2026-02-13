import { xCreatorEditorMapStatusType } from '@spectral/types';

export class CreatorEditorFindDto {
  creatorId: string;
  editorId: string;
  editorMail: string;
  editorName: string;
  editorAvatar: string;
  status: xCreatorEditorMapStatusType;
}
