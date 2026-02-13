import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DriveService } from '../../application/services/drive.service';
import { UploadImageDto } from '../../application/dtos/uploadImage.dto';
import { UploadVideoDto } from '../../application/dtos/uploadVideo.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../../../../../utilities/auth/decorator/role/role.decorator';
import { Public } from '../../../../../../utilities/auth/decorator/api/public.decorator';

@Controller('drive')
@ApiTags('Drive')
@ApiSecurity('Authorization')
@ApiSecurity('x-api-key')
export class DriveController {
  constructor(private readonly driveService: DriveService) {}

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload image file with resumable upload',
    description:
      'Uploads an image file to Google Drive using resumable upload with chunking for better reliability and progress tracking',
  })
  @ApiResponse({
    status: 200,
    description: 'File uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Google Drive view URL' },
        fileId: { type: 'string', description: 'Google Drive file ID' },
      },
    },
  })
  @ApiBody({
    description: 'Upload an image file',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file to upload (JPEG, PNG, GIF)',
        },
        folderName: { type: 'string', example: 'my-image-folder' },
        folder: {
          type: 'string',
          example: 'users/profile-pics',
        },
        fileName: {
          type: 'string',
          example: 'profile-123.jpg',
        },
      },
    },
  })
  @Roles('creator', 'editor')
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadImageDto: UploadImageDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const result = await this.driveService.uploadFile({
        file,
        folderName: uploadImageDto.folderName,
        folder: uploadImageDto.folder,
        fileName: uploadImageDto.fileName,
      });
      return result;
    } catch (error) {
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }
  }

  @Post('upload-video')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload video file with resumable upload',
    description:
      'Uploads a video file to Google Drive using resumable upload with chunking for better reliability and progress tracking',
  })
  @ApiResponse({
    status: 200,
    description: 'File uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Google Drive view URL' },
        fileId: { type: 'string', description: 'Google Drive file ID' },
      },
    },
  })
  @ApiBody({
    description: 'Upload a video file',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Video file to upload (MP4, MOV, AVI)',
        },
        folderName: { type: 'string', example: 'my-video-folder' },
        folder: { type: 'string', example: 'users/videos' },
        fileName: { type: 'string', example: 'video-123.mp4' },
      },
    },
  })
  @Roles('creator', 'editor')
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadVideoDto: UploadVideoDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const result = await this.driveService.uploadFile({
        file,
        folderName: uploadVideoDto.folderName,
        folder: uploadVideoDto.folder,
        fileName: uploadVideoDto.fileName,
      });
      return result;
    } catch (error) {
      throw new BadRequestException(`Failed to upload video: ${error.message}`);
    }
  }

  @Post('create-folder/:folderName')
  @ApiOperation({
    summary: 'Create a new folder in Google Drive',
    description:
      'Creates a new folder in Google Drive that can be used to organize uploaded files',
  })
  @ApiResponse({
    status: 200,
    description: 'Folder created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        folderId: { type: 'string', description: 'Google Drive folder ID' },
      },
    },
  })
  @Roles('creator', 'editor')
  async createFolder(@Param('folderName') folderName: string) {
    try {
      const result = await this.driveService.createFolder(folderName);
      return {
        success: true,
        message: 'Folder created successfully',
        folderId: result,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to create folder: ${error.message}`,
      );
    }
  }

  @Get('check-if-folder-exists/:folderName')
  @ApiOperation({
    summary: 'Check if folder exists in Google Drive',
    description:
      'Checks whether a folder with the given name exists in Google Drive',
  })
  @ApiResponse({
    status: 200,
    description: 'Folder existence check result',
    schema: {
      type: 'boolean',
      description: 'True if folder exists, false otherwise',
    },
  })
  @Roles('creator', 'editor')
  async checkIfFolderExists(@Param('folderName') folderName: string) {
    try {
      const result = await this.driveService.folderExists(folderName);
      return result;
    } catch (error) {
      throw new BadRequestException(`Failed to check folder: ${error.message}`);
    }
  }

  @Get('auth-url')
  @ApiOperation({
    summary: 'Get Google OAuth2 authorization URL',
    description: 'Returns the URL for Google OAuth2 authorization flow',
  })
  @ApiResponse({
    status: 200,
    description: 'Authorization URL generated successfully',
    schema: {
      type: 'object',
      properties: {
        authUrl: {
          type: 'string',
          description: 'Google OAuth2 authorization URL',
        },
      },
    },
  })
  getAuthUrl() {
    try {
      const authUrl = this.driveService.getAuthUrl();
      return { authUrl };
    } catch (error) {
      throw new BadRequestException(
        `Failed to generate auth URL: ${error.message}`,
      );
    }
  }

  @Get('oauth-callback')
  @ApiOperation({
    summary: 'Handle OAuth2 callback with authorization code',
    description: 'Exchanges authorization code for access and refresh tokens',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Authorization code from Google OAuth2',
        },
      },
      required: ['code'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'OAuth2 tokens exchanged successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @Public()
  async handleOAuthCallback(@Query('code') code: string) {
    try {
      await this.driveService.setCredentials(code);
      return {
        success: true,
        message: 'Authentication successful',
      };
    } catch (error) {
      throw new BadRequestException(`OAuth callback failed: ${error.message}`);
    }
  }
  @ApiOperation({
    summary: 'Check if folder exists in Google Drive',
    description:
      'Checks whether a folder with the given name exists in Google Drive',
  })
  @ApiResponse({
    status: 200,
    description: 'Folder existence check result',
    schema: {
      type: 'boolean',
      description: 'True if folder exists, false otherwise',
    },
  })
  @Roles('creator', 'editor')
  async isFolderExists(@Param('folderName') folderName: string) {
    try {
      const result = await this.driveService.folderExists(folderName);
      return result;
    } catch (error) {
      throw new BadRequestException(`Failed to check folder: ${error.message}`);
    }
  }
}
