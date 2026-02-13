import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { MediaService } from '../../application/services/media.service';
import { CreateMediaDto } from '../../application/dtos/create-media.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiSecurity, ApiTags } from '@nestjs/swagger';

@Controller('media')
@ApiTags('Media')
@ApiSecurity('Authorization')
@ApiSecurity('x-api-key')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a file',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
        type: { type: 'string', example: 'IMAGE' },
        folderId: {
          type: 'string',
          description: 'Optional folder ID to associate media with',
          example: 'd7559eb1-e7c0-41c2-bbc9-ac826b484c83',
        },
        accountId: {
          type: 'string',
          description: 'Account ID for folder relation',
          example: 'd7559eb1-e7c0-41c2-bbc9-ac826b484c83',
        },
        creatorId: {
          type: 'string',
          description: 'Creator ID for folder relation',
          example: 'd7559eb1-e7c0-41c2-bbc9-ac826b484c83',
        },
        editorId: {
          type: 'string',
          description: 'Editor ID for folder relation',
          example: 'd7559eb1-e7c0-41c2-bbc9-ac826b484c83',
        },
      },
    },
  })
  async create(
    @Body() createMediaDto: CreateMediaDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.mediaService.create(createMediaDto, file, req.user.id);
  }

  // @Get()
  // async findAll() {
  //   return this.mediaService.findAll();
  // }

  // @Get(':id')
  // async findById(@Param('id') id: string) {
  //   return this.mediaService.findById(id);
  // }

  // @Put(':id')
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateMediaDto: UpdateMediaDto,
  // ) {
  //   return this.mediaService.update(id, updateMediaDto);
  // }

  // @Delete(':id')
  // async delete(@Param('id') id: string) {
  //   return this.mediaService.delete(id);
  // }

  // @Post('folder-items')
  // async createFolderItem(@Body() createFolderItemDto: CreateFolderItemDto) {
  //   return this.mediaService.createFolderItem(
  //     createFolderItemDto.folderId,
  //     createFolderItemDto.mediaId,
  //   );
  // }

  // @Get('folder-items/:folderId')
  // async getFolderItems(@Param('folderId') folderId: string) {
  //   return this.mediaService.getFolderItems(folderId);
  // }

  // @Get('folder-items/:folderId/:mediaId')
  // async getFolderItem(
  //   @Param('folderId') folderId: string,
  //   @Param('mediaId') mediaId: string,
  // ) {
  //   return this.mediaService.getFolderItem(folderId, mediaId);
  // }

  // @Delete('folder-items/:folderId/:mediaId')
  // async deleteFolderItem(
  //   @Param('folderId') folderId: string,
  //   @Param('mediaId') mediaId: string,
  // ) {
  //   return this.mediaService.deleteFolderItem(folderId, mediaId);
  // }
}
