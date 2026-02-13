import { Controller, Get, Param, Post, Put, Req } from '@nestjs/common';

// creator editor
import { CreatorEditorMapService } from '../../application/services/map.service';

// account editor
import { AccountEditorMapService } from '../../application/services/map.service';
import { ApiSecurity } from '@nestjs/swagger';
import { xCreatorEditorMapStatusType } from '@spectral/types';
import { Roles } from 'src/utilities/auth/decorator/role/role.decorator';
import { Request } from 'express';

@ApiSecurity('x-api-key')
@ApiSecurity('Authorization')
@Controller('creator-editor-map')
export class CreatorEditorMapController {
  constructor(
    private readonly creatorEditorMapService: CreatorEditorMapService,
  ) {}

  // get creator-editor map by creatorxCreatorEditorMapStatusTypeId and editorMail
  @Get('find-map/:editorMail')
  @Roles('creator')
  async findMap(@Req() req: Request, @Param('editorMail') editorMail: string) {
    const creatorId = (req as any).user.id;
    return this.creatorEditorMapService.findMap(creatorId, editorMail);
  }

  // get creator-editor maps by creatorId
  @Get('find-maps-by-creator')
  @Roles('creator')
  async findMapsByCreatorId(@Req() req: Request) {
    const creatorId = (req as any).user.id;
    return this.creatorEditorMapService.findMapsByCreatorId(creatorId);
  }

  // get creator-editor maps by editorId
  @Get('find-maps-by-editor')
  @Roles('editor')
  async findMapsByEditorId(@Req() req: Request) {
    const editorId = (req as any).user.id;
    return this.creatorEditorMapService.findMapsByEditorId(editorId);
  }
  //  request editor
  @Post('request-editor/:editorId')
  @Roles('creator')
  async requestEditor(
    @Req() req: Request,
    @Param('editorId') editorId: string,
  ) {
    const creatorId = (req as any).user.id;
    return this.creatorEditorMapService.requestEditor(creatorId, editorId);
  }

  // unlink editor
  @Put('update-status/:mapId/:status')
  async updateEditor(
    @Param('mapId') mapId: string,
    @Param('status') status: xCreatorEditorMapStatusType,
  ) {
    console.log('Updating editor with mapId:', mapId, 'and status:', status);
    return this.creatorEditorMapService.update(mapId, {
      status: status,
    });
  }
}

// account - editor map
@ApiSecurity('x-api-key')
@ApiSecurity('Authorization')
@Controller('account-editor-map')
export class AccountEditorMapController {
  constructor(
    private readonly accountEditorMapService: AccountEditorMapService,
  ) {}

  // 1) Get liked accounts by editorID
  // 2) Make a link b/w editor and account ( update-status )
  // // 2.1) If creator-editor-account map exists, update status
  // // 2.2) If not, create a new map
  // 3) Unlink account from editor ( update-status to INACTIVE )

  // 1) Get accounts linked to an editor by editorID
  @Get('find-accounts-by-editor')
  @Roles('editor')
  async findAccountsByEditorId(@Req() req: Request) {
    const editorId = (req as any).user.id;
    return this.accountEditorMapService.findAccountsByEditorId(editorId);
  }

  // 0) Get all account editors linked to a creator
  @Get('get-account-editors/:accountId')
  @Roles('creator')
  async findAccountEditors(
    @Req() req: Request,
    @Param('accountId') accountId: string,
  ) {
    const creatorId = (req as any).user.id;
    return this.accountEditorMapService.findAccountEditors(
      creatorId,
      accountId,
    );
  }
  // 2)  between editor and account (called by creator)
  @Post('link-editor-to-account/:accountId/:editorId')
  @Roles('creator')
  async linkEditorToAccount(
    @Req() req: Request,
    @Param('accountId') accountId: string,
    @Param('editorId') editorId: string,
  ) {
    const creatorId = (req as any).user.id;
    return this.accountEditorMapService.linkEditorToAccount(
      creatorId,
      accountId,
      editorId,
    );
  }

  // 3) Unlink account from editor (update status to INACTIVE)
  @Put('unlink-editor-from-account/:accountId/:editorId')
  @Roles('creator')
  async unlinkEditorFromAccount(
    @Req() req: Request,
    @Param('accountId') accountId: string,
    @Param('editorId') editorId: string,
  ) {
    const creatorId = (req as any).user.id;
    return this.accountEditorMapService.unlinkEditorFromAccount(
      creatorId,
      accountId,
      editorId,
    );
  }
}
