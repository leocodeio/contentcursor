import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  Param,
  Get,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GcpBucketService } from '../../application/services/gcp-bucket.service';
import { UploadImageDto } from '../../application/dtos/uploadImage.dto';
import { UploadVideoDto } from '../../application/dtos/uploadVideo.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { Response } from 'express';

@Controller('gcp-bucket')
@ApiTags('GCP Bucket')
@ApiSecurity('x-api-key')
@ApiSecurity('Authorization')
export class GcpBucketController {
  constructor(private readonly gcpBucketService: GcpBucketService) {}

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an image file to GCP bucket' })
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
        bucketName: { type: 'string', example: 'my-image-bucket' },
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
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadImageDto: UploadImageDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const result = await this.gcpBucketService.uploadFile({
        file,
        bucketName: uploadImageDto.bucketName,
        folder: uploadImageDto.folder,
        fileName: uploadImageDto.fileName,
      });
      return result;
    } catch (error: any) {
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }
  }

  @Post('upload-video')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a video file to GCP bucket' })
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
        bucketName: { type: 'string', example: 'my-video-bucket' },
        folder: { type: 'string', example: 'users/videos' },
        fileName: { type: 'string', example: 'video-123.mp4' },
      },
    },
  })
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadVideoDto: UploadVideoDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const result = await this.gcpBucketService.uploadFile({
        file,
        bucketName: uploadVideoDto.bucketName,
        folder: uploadVideoDto.folder,
        fileName: uploadVideoDto.fileName,
      });
      return result;
    } catch (error: any) {
      throw new BadRequestException(`Failed to upload video: ${error.message}`);
    }
  }

  @Post('create-bucket/:bucketName')
  @ApiOperation({ summary: 'Create a new GCP bucket' })
  @ApiParam({ name: 'bucketName', description: 'Name of the bucket to create' })
  async createBucket(@Param('bucketName') bucketName: string) {
    try {
      const result = await this.gcpBucketService.createBucket(bucketName);
      return {
        success: true,
        message: 'Bucket created successfully',
        result,
      };
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to create bucket: ${error.message}`,
      );
    }
  }

  @Get('is-bucket-exists/:bucketName')
  @ApiOperation({ summary: 'Check if a GCP bucket exists' })
  @ApiParam({ name: 'bucketName', description: 'Name of the bucket to check' })
  async isBucketExists(@Param('bucketName') bucketName: string) {
    try {
      const result = await this.gcpBucketService.bucketExists(bucketName);
      return {
        bucketName,
        exists: result,
      };
    } catch (error: any) {
      throw new BadRequestException(`Failed to check bucket: ${error.message}`);
    }
  }

  @Get('stream/:bucketName/:fileName')
  @ApiOperation({ summary: 'Stream a file from GCP bucket' })
  @ApiParam({ name: 'bucketName', description: 'Name of the bucket' })
  @ApiParam({ name: 'fileName', description: 'Name of the file to stream' })
  async streamFile(
    @Param('bucketName') bucketName: string,
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    try {
      // Get file metadata for proper content type
      const metadata = await this.gcpBucketService.getFileMetadata(
        bucketName,
        fileName,
      );

      // Get file stream
      const fileStream = await this.gcpBucketService.getFileStream(
        bucketName,
        fileName,
      );

      // Set proper headers
      res.set({
        'Content-Type': metadata.contentType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'public, max-age=31536000',
      });

      // Pipe the stream to response
      fileStream.pipe(res);

      fileStream.on('error', (error: any) => {
        this.gcpBucketService['logger'].error(`Stream error: ${error.message}`);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to stream file' });
        }
      });
    } catch (error: any) {
      throw new BadRequestException(`Failed to stream file: ${error.message}`);
    }
  }
}
