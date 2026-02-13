import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  Param,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from '../../application/services/s3.service';
import { UploadImageDto } from '../../application/dtos/uploadImage.dto';
import { UploadVideoDto } from '../../application/dtos/uploadVideo.dto';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
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
      const result = await this.s3Service.uploadFile({
        file,
        bucketName: uploadImageDto.bucketName,
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
      const result = await this.s3Service.uploadFile({
        file,
        bucketName: uploadVideoDto.bucketName,
        folder: uploadVideoDto.folder,
        fileName: uploadVideoDto.fileName,
      });
      return result;
    } catch (error) {
      throw new BadRequestException(`Failed to upload video: ${error.message}`);
    }
  }

  @Post('create-bucket/:bucketName')
  async createBucket(@Param('bucketName') bucketName: string) {
    try {
      const result = await this.s3Service.createBucket(bucketName);
      return {
        success: true,
        message: 'Bucket created successfully',
        result,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to create bucket: ${error.message}`,
      );
    }
  }

  @Get('is-bucket-exists/:bucketName')
  async isBucketExists(@Param('bucketName') bucketName: string) {
    try {
      const result = await this.s3Service.bucketExists(bucketName);
      return result;
    } catch (error) {
      throw new BadRequestException(`Failed to check bucket: ${error.message}`);
    }
  }
}
