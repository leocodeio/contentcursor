import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { S3Controller } from './s3.controller';
import { S3Service } from '../../application/services/s3.service';
import { UploadImageDto } from '../../application/dtos/uploadImage.dto';
import { UploadVideoDto } from '../../application/dtos/uploadVideo.dto';

describe('S3Controller', () => {
  let controller: S3Controller;
  let s3Service: jest.Mocked<S3Service>;

  const mockFile = {
    fieldname: 'file',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('test'),
  } as Express.Multer.File;

  const mockUploadResult = {
    url: 'https://s3.amazonaws.com/bucket/file.jpg',
    fileName: 'file.jpg',
    bucketName: 'test-bucket',
    key: 'folder/file.jpg',
  };

  beforeEach(async () => {
    const mockS3Service = {
      uploadFile: jest.fn(),
      createBucket: jest.fn(),
      bucketExists: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [S3Controller],
      providers: [
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
      ],
    }).compile();

    controller = module.get<S3Controller>(S3Controller);
    s3Service = module.get(S3Service);
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

      s3Service.uploadFile.mockResolvedValue(mockUploadResult);

      const result = await controller.uploadImage(mockFile, uploadImageDto);

      expect(result).toEqual(mockUploadResult);
      expect(s3Service.uploadFile).toHaveBeenCalledWith({
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

      s3Service.uploadFile.mockRejectedValue(new Error('Upload failed'));

      await expect(
        controller.uploadImage(mockFile, uploadImageDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.uploadImage(mockFile, uploadImageDto),
      ).rejects.toThrow('Failed to upload image: Upload failed');
    });
  });

  describe('uploadVideo', () => {
    it('should upload video successfully', async () => {
      const uploadVideoDto: UploadVideoDto = {
        bucketName: 'video-bucket',
        folder: 'videos',
        fileName: 'test.mp4',
      };

      s3Service.uploadFile.mockResolvedValue(mockUploadResult);

      const result = await controller.uploadVideo(mockFile, uploadVideoDto);

      expect(result).toEqual(mockUploadResult);
      expect(s3Service.uploadFile).toHaveBeenCalledWith({
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

      s3Service.uploadFile.mockRejectedValue(new Error('Upload failed'));

      await expect(
        controller.uploadVideo(mockFile, uploadVideoDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.uploadVideo(mockFile, uploadVideoDto),
      ).rejects.toThrow('Failed to upload video: Upload failed');
    });
  });

  describe('createBucket', () => {
    it('should create bucket successfully', async () => {
      const bucketName = 'new-bucket';
      const bucketResult = { Location: 'us-east-1' };

      s3Service.createBucket.mockResolvedValue(bucketResult as any);

      const result = await controller.createBucket(bucketName);

      expect(result).toEqual({
        success: true,
        message: 'Bucket created successfully',
        result: bucketResult,
      });
      expect(s3Service.createBucket).toHaveBeenCalledWith(bucketName);
    });

    it('should throw BadRequestException when bucket creation fails', async () => {
      const bucketName = 'invalid-bucket';

      s3Service.createBucket.mockRejectedValue(new Error('Creation failed'));

      await expect(controller.createBucket(bucketName)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.createBucket(bucketName)).rejects.toThrow(
        'Failed to create bucket: Creation failed',
      );
    });
  });

  describe('isBucketExists', () => {
    it('should return true when bucket exists', async () => {
      const bucketName = 'existing-bucket';

      s3Service.bucketExists.mockResolvedValue(true);

      const result = await controller.isBucketExists(bucketName);

      expect(result).toBe(true);
      expect(s3Service.bucketExists).toHaveBeenCalledWith(bucketName);
    });

    it('should return false when bucket does not exist', async () => {
      const bucketName = 'non-existing-bucket';

      s3Service.bucketExists.mockResolvedValue(false);

      const result = await controller.isBucketExists(bucketName);

      expect(result).toBe(false);
      expect(s3Service.bucketExists).toHaveBeenCalledWith(bucketName);
    });

    it('should throw BadRequestException when check fails', async () => {
      const bucketName = 'test-bucket';

      s3Service.bucketExists.mockRejectedValue(new Error('Check failed'));

      await expect(controller.isBucketExists(bucketName)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.isBucketExists(bucketName)).rejects.toThrow(
        'Failed to check bucket: Check failed',
      );
    });
  });
});
