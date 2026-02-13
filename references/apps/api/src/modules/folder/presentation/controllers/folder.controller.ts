import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiSecurity,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { FolderService } from '../../application/services/folder.service';
import {
  FolderItemResponseDto,
  UpdateFolderDto,
  CreateFolderItemDto,
} from '../../application/dtos';
import { Roles } from 'src/utilities/auth/decorator/role/role.decorator';
import {
  CreateFolderByCreatorDto,
  CreateFolderByEditorDto,
  CreateFolderDto,
} from '../../application/dtos/create-folder.dto';
import { xDomainFolders } from 'src/modules/folder/domain/models/folder.model';
import { xDomainFolderItem } from '@spectral/types';

@ApiTags('folders')
@ApiSecurity('x-api-key')
@ApiSecurity('Authorization')
@Controller('folders')
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Get('by-creator/:accountId')
  @Roles('creator')
  @ApiOperation({ summary: 'Get folders where user is the creator' })
  @ApiResponse({
    status: 200,
    description: 'Folders retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Folders not found',
  })
  async getFoldersByCreator(
    @Req() req: AuthenticatedRequest,
    @Param('accountId') accountId: string,
  ): Promise<xDomainFolders[]> {
    const creatorId = req.user.id;
    const folders = await this.folderService.getFoldersByCreator(
      creatorId,
      accountId,
    );

    return folders;
  }

  @Get('by-editor/:accountId')
  @Roles('editor')
  @ApiOperation({ summary: 'Get folders where user is the editor' })
  @ApiResponse({
    status: 200,
    description: 'Folders retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Folders not found',
  })
  async getFoldersByEditor(
    @Req() req: AuthenticatedRequest,
    @Param('accountId') accountId: string,
  ): Promise<xDomainFolders[]> {
    const editorId = req.user.id;
    const folders = await this.folderService.getFoldersByEditor(
      editorId,
      accountId,
    );

    return folders;
  }

  @Get('items')
  @Roles('creator', 'editor')
  @ApiOperation({
    summary: 'Get folder items accessible by creator and editor',
  })
  @ApiQuery({
    name: 'creatorId',
    description: 'Creator ID',
    required: true,
    type: 'string',
  })
  @ApiQuery({
    name: 'editorId',
    description: 'Editor ID',
    required: true,
    type: 'string',
  })
  @ApiQuery({
    name: 'accountId',
    description: 'Account ID',
    required: true,
    type: 'string',
  })
  @ApiQuery({
    name: 'folderName',
    description: 'Folder name',
    required: true,
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Folder items retrieved successfully',
    type: [FolderItemResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Folder items not found',
  })
  async getFolderItems(
    @Query('creatorId') creatorId: string,
    @Query('editorId') editorId: string,
    @Query('accountId') accountId: string,
    @Query('folderName') folderName: string,
  ): Promise<xDomainFolderItem[]> {
    const folderItems = await this.folderService.getFolderItems(
      creatorId,
      editorId,
      accountId,
      folderName,
    );

    return folderItems.map((item) => ({
      id: item.id,
      folderId: item.folderId,
      mediaId: item.mediaId,
      media: {
        id: item.media.id,
        type: item.media.type,
        integrationUrl: item.media.integrationUrl,
        integrationKey: item.media.integrationKey,
      },
    }));
  }

  @Post('by-creator')
  @Roles('creator')
  @ApiOperation({ summary: 'Create a new folder by creator' })
  @ApiBody({ type: CreateFolderByCreatorDto })
  @ApiResponse({
    status: 201,
    description: 'Folder created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - folder with this name already exists',
  })
  async createFolderByCreator(
    @Body() createFolderDto: CreateFolderByCreatorDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<xDomainFolders> {
    const creatorId = req.user.id;
    const extendedDto: CreateFolderDto = {
      ...createFolderDto,
      creatorId,
    };
    const folder = await this.folderService.createFolder(extendedDto);

    return folder;
  }

  @Post('by-editor')
  @Roles('editor')
  @ApiOperation({ summary: 'Create a new folder by editor' })
  @ApiBody({ type: CreateFolderByEditorDto })
  @ApiResponse({
    status: 201,
    description: 'Folder created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - folder with this name already exists',
  })
  async createFolderByEditor(
    @Body() createFolderDto: CreateFolderByEditorDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<xDomainFolders> {
    const editorId = req.user.id;
    const extendedDto: CreateFolderDto = {
      ...createFolderDto,
      editorId,
    };
    const folder = await this.folderService.createFolder(extendedDto);

    return folder;
  }

  @Put(':id')
  @Roles('creator', 'editor')
  @ApiOperation({ summary: 'Update an existing folder' })
  @ApiBody({ type: UpdateFolderDto })
  @ApiResponse({
    status: 200,
    description: 'Folder updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Folder not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - folder with this name already exists',
  })
  async updateFolder(
    @Param('id') id: string,
    @Body() updateFolderDto: UpdateFolderDto,
  ): Promise<xDomainFolders> {
    const folder = await this.folderService.updateFolder(id, updateFolderDto);

    return folder;
  }

  @Delete(':id')
  @Roles('creator', 'editor')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a folder (soft delete)' })
  @ApiResponse({
    status: 204,
    description: 'Folder deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Folder not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to delete folder',
  })
  async deleteFolder(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<boolean> {
    const result = await this.folderService.deleteFolder(id, req.user.id);
    return result;
  }

  @Get(':id')
  @Roles('creator', 'editor')
  @ApiOperation({ summary: 'Get folder by ID' })
  @ApiResponse({
    status: 200,
    description: 'Folder retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Folder not found',
  })
  async getFolderById(@Param('id') id: string): Promise<xDomainFolders> {
    const folder = await this.folderService.getFolderById(id);

    return folder;
  }

  // Folder Items endpoints
  @Post('items')
  @Roles('creator', 'editor')
  @ApiOperation({ summary: 'Create a folder item (add media to folder)' })
  @ApiBody({ type: CreateFolderItemDto })
  @ApiResponse({
    status: 201,
    description: 'Folder item created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid input data',
  })
  async createFolderItem(
    @Body() createFolderItemDto: CreateFolderItemDto,
  ): Promise<xDomainFolderItem> {
    return this.folderService.createFolderItem(createFolderItemDto);
  }

  @Get(':folderId/items')
  @Roles('creator', 'editor')
  @ApiOperation({ summary: 'Get all items in a folder' })
  @ApiResponse({
    status: 200,
    description: 'Folder items retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Folder not found',
  })
  async getFolderItemsByFolderId(
    @Param('folderId') folderId: string,
  ): Promise<xDomainFolderItem[]> {
    return this.folderService.getFolderItemsByFolderId(folderId);
  }

  @Get(':folderId/items/:mediaId')
  @Roles('creator', 'editor')
  @ApiOperation({ summary: 'Get a specific folder item' })
  @ApiResponse({
    status: 200,
    description: 'Folder item retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Folder item not found',
  })
  async getFolderItem(
    @Param('folderId') folderId: string,
    @Param('mediaId') mediaId: string,
  ): Promise<xDomainFolderItem | null> {
    return this.folderService.getFolderItem(folderId, mediaId);
  }

  @Delete(':folderId/items/:mediaId')
  @Roles('creator', 'editor')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove media from folder' })
  @ApiResponse({
    status: 204,
    description: 'Folder item deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Folder item not found',
  })
  async deleteFolderItem(
    @Param('folderId') folderId: string,
    @Param('mediaId') mediaId: string,
  ): Promise<void> {
    return this.folderService.deleteFolderItem(folderId, mediaId);
  }
}
