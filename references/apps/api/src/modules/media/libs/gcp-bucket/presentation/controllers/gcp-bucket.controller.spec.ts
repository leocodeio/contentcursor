import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { GcpBucketController } from './gcp-bucket.controller';
import { GcpBucketService } from '../../application/services/gcp-bucket.service';
import { UploadImageDto } from '../../application/dtos/uploadImage.dto';
import { UploadVideoDto } from '../../application/dtos/uploadVideo.dto';

describe('GcpBucketController', () => {
  let controller: GcpBucketController;
  let gcpBucketService: jest.Mocked<GcpBucketService>;

  const mockFile = {
    fieldname: 'file',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('test'),
  } as Express.Multer.File;

  const mockUploadResult = {
    url: 'https://storage.googleapis.com/bucket/file.jpg',
    fileName: 'file.jpg',
    bucketName: 'test-bucket',
  };

  const mockFileMetadata = {
    contentType: 'image/jpeg',
    size: 1024,
    timeCreated: new Date(),
  };

  const mockFileStream = {
    pipe: jest.fn(),
    on: jest.fn(),
  };

  const mockResponse = {
    set: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    headersSent: false,
  } as unknown as Response;

  beforeEach(async () => {
    const mockGcpBucketService = {
      uploadFile: jest.fn(),
      createBucket: jest.fn(),
      bucketExists: jest.fn(),
      getFileMetadata: jest.fn(),
      getFileStream: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GcpBucketController],
      providers: [
        {
          provide: GcpBucketService,
          useValue: mockGcpBucketService,
        },
      ],
    }).compile();

    controller = module.get<GcpBucketController>(GcpBucketController);
    gcpBucketService = module.get(GcpBucketService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      const uploadImageDto: UploadImageDto = {
        bucketName: 'test-bucket',
        folder: 'images',
        fileName: 'test.jpg',
      };

      gcpBucketService.uploadFile.mockResolvedValue(mockUploadResult);

      const result = await controller.uploadImage(mockFile, uploadImageDto);

      expect(result).toEqual(mockUploadResult);
      expect(gcpBucketService.uploadFile).toHaveBeenCalledWith({
        file: mockFile,
        bucketName: uploadImageDto.bucketName,
        folder: uploadImageDto.folder,
        fileName: uploadImageDto.fileName,
      });
    });

    it('should throw BadRequestException when no file is uploaded', async () => {
      const uploadImageDto: UploadImageDto = {
        bucketName: 'test-bucket',
      };

      await expect(
        controller.uploadImage(null as any, uploadImageDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.uploadImage(null as any, uploadImageDto),
      ).rejects.toThrow('No file uploaded');
    });

    it('should throw BadRequestException when upload fails', async () => {
      const uploadImageDto: UploadImageDto = {
        bucketName: 'test-bucket',
      };

      gcpBucketService.uploadFile.mockRejectedValue(new Error('Upload failed'));

      await expect(
        controller.uploadImage(mockFile, uploadImageDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('uploadVideo', () => {
    it('should upload video successfully', async () => {
      const uploadVideoDto: UploadVideoDto = {
        bucketName: 'video-bucket',
        folder: 'videos',
        fileName: 'test.mp4',
      };

      gcpBucketService.uploadFile.mockResolvedValue(mockUploadResult);

      const result = await controller.uploadVideo(mockFile, uploadVideoDto);

      expect(result).toEqual(mockUploadResult);
      expect(gcpBucketService.uploadFile).toHaveBeenCalledWith({
        file: mockFile,
        bucketName: uploadVideoDto.bucketName,
        folder: uploadVideoDto.folder,
        fileName: uploadVideoDto.fileName,
      });
    });

    it('should throw BadRequestException when no file is uploaded', async () => {
      const uploadVideoDto: UploadVideoDto = {
        bucketName: 'video-bucket',
      };

      await expect(
        controller.uploadVideo(null as any, uploadVideoDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.uploadVideo(null as any, uploadVideoDto),
      ).rejects.toThrow('No file uploaded');
    });

    it('should throw BadRequestException when upload fails', async () => {
      const uploadVideoDto: UploadVideoDto = {
        bucketName: 'video-bucket',
      };

      gcpBucketService.uploadFile.mockRejectedValue(new Error('Upload failed'));

      await expect(
        controller.uploadVideo(mockFile, uploadVideoDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createBucket', () => {
    it('should create bucket successfully', async () => {
      const bucketName = 'new-bucket';
      const bucketResult = { name: bucketName, location: 'US' };

      gcpBucketService.createBucket.mockResolvedValue(bucketResult as any);

      const result = await controller.createBucket(bucketName);

      expect(result).toEqual({
        success: true,
        message: 'Bucket created successfully',
        result: bucketResult,
      });
      expect(gcpBucketService.createBucket).toHaveBeenCalledWith(bucketName);
    });

    it('should throw BadRequestException when bucket creation fails', async () => {
      const bucketName = 'invalid-bucket';

      gcpBucketService.createBucket.mockRejectedValue(
        new Error('Creation failed'),
      );

      await expect(controller.createBucket(bucketName)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('isBucketExists', () => {
    it('should return true when bucket exists', async () => {
      const bucketName = 'existing-bucket';

      gcpBucketService.bucketExists.mockResolvedValue(true);

      const result = await controller.isBucketExists(bucketName);

      expect(result).toEqual({
        bucketName,
        exists: true,
      });
      expect(gcpBucketService.bucketExists).toHaveBeenCalledWith(bucketName);
    });

    it('should return false when bucket does not exist', async () => {
      const bucketName = 'non-existing-bucket';

      gcpBucketService.bucketExists.mockResolvedValue(false);

      const result = await controller.isBucketExists(bucketName);

      expect(result).toEqual({
        bucketName,
        exists: false,
      });
      expect(gcpBucketService.bucketExists).toHaveBeenCalledWith(bucketName);
    });

    it('should throw BadRequestException when check fails', async () => {
      const bucketName = 'test-bucket';

      gcpBucketService.bucketExists.mockRejectedValue(
        new Error('Check failed'),
      );

      await expect(controller.isBucketExists(bucketName)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('streamFile', () => {
    it('should stream file successfully', async () => {
      const bucketName = 'test-bucket';
      const fileName = 'test.jpg';

      gcpBucketService.getFileMetadata.mockResolvedValue(mockFileMetadata);
      gcpBucketService.getFileStream.mockResolvedValue(mockFileStream as any);

      await controller.streamFile(bucketName, fileName, mockResponse);

      expect(gcpBucketService.getFileMetadata).toHaveBeenCalledWith(
        bucketName,
        fileName,
      );
      expect(gcpBucketService.getFileStream).toHaveBeenCalledWith(
        bucketName,
        fileName,
      );
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'public, max-age=31536000',
      });
      expect(mockFileStream.pipe).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle missing content type', async () => {
      const bucketName = 'test-bucket';
      const fileName = 'test.bin';
      const metadataWithoutContentType = {
        ...mockFileMetadata,
        contentType: undefined,
      };

      gcpBucketService.getFileMetadata.mockResolvedValue(
        metadataWithoutContentType,
      );
      gcpBucketService.getFileStream.mockResolvedValue(mockFileStream as any);

      await controller.streamFile(bucketName, fileName, mockResponse);

      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'public, max-age=31536000',
      });
    });

    it('should throw BadRequestException when streaming fails', async () => {
      const bucketName = 'test-bucket';
      const fileName = 'non-existing.jpg';

      gcpBucketService.getFileMetadata.mockRejectedValue(
        new Error('File not found'),
      );

      await expect(
        controller.streamFile(bucketName, fileName, mockResponse),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
