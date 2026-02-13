import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { DriveController } from './drive.controller';
import { DriveService } from '../../application/services/drive.service';
import { UploadImageDto } from '../../application/dtos/uploadImage.dto';
import { UploadVideoDto } from '../../application/dtos/uploadVideo.dto';

describe('DriveController', () => {
  let controller: DriveController;
  let driveService: jest.Mocked<DriveService>;

  const mockFile = {
    fieldname: 'file',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('test'),
  } as Express.Multer.File;

  const mockUploadResult = {
    url: 'https://drive.google.com/file/d/1234567890/view',
    fileId: '1234567890',
  };

  beforeEach(async () => {
    const mockDriveService = {
      uploadFile: jest.fn(),
      createFolder: jest.fn(),
      folderExists: jest.fn(),
      getAuthUrl: jest.fn(),
      setCredentials: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DriveController],
      providers: [
        {
          provide: DriveService,
          useValue: mockDriveService,
        },
      ],
    }).compile();

    controller = module.get<DriveController>(DriveController);
    driveService = module.get(DriveService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      const uploadImageDto: UploadImageDto = {
        folderName: 'test-folder',
        folder: 'images',
        fileName: 'test.jpg',
      };

      driveService.uploadFile.mockResolvedValue(mockUploadResult);

      const result = await controller.uploadImage(mockFile, uploadImageDto);

      expect(result).toEqual(mockUploadResult);
      expect(driveService.uploadFile).toHaveBeenCalledWith({
        file: mockFile,
        folderName: uploadImageDto.folderName,
        folder: uploadImageDto.folder,
        fileName: uploadImageDto.fileName,
      });
    });

    it('should throw BadRequestException when no file is uploaded', async () => {
      const uploadImageDto: UploadImageDto = {
        folderName: 'test-folder',
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
        folderName: 'test-folder',
      };

      driveService.uploadFile.mockRejectedValue(new Error('Upload failed'));

      await expect(
        controller.uploadImage(mockFile, uploadImageDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('uploadVideo', () => {
    it('should upload video successfully', async () => {
      const uploadVideoDto: UploadVideoDto = {
        folderName: 'video-folder',
        folder: 'videos',
        fileName: 'test.mp4',
      };

      driveService.uploadFile.mockResolvedValue(mockUploadResult);

      const result = await controller.uploadVideo(mockFile, uploadVideoDto);

      expect(result).toEqual(mockUploadResult);
      expect(driveService.uploadFile).toHaveBeenCalledWith({
        file: mockFile,
        folderName: uploadVideoDto.folderName,
        folder: uploadVideoDto.folder,
        fileName: uploadVideoDto.fileName,
      });
    });

    it('should throw BadRequestException when no file is uploaded', async () => {
      const uploadVideoDto: UploadVideoDto = {
        folderName: 'video-folder',
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
        folderName: 'video-folder',
      };

      driveService.uploadFile.mockRejectedValue(new Error('Upload failed'));

      await expect(
        controller.uploadVideo(mockFile, uploadVideoDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createFolder', () => {
    it('should create folder successfully', async () => {
      const folderName = 'test-folder';
      const folderId = 'folder123';

      driveService.createFolder.mockResolvedValue(folderId);

      const result = await controller.createFolder(folderName);

      expect(result).toEqual({
        success: true,
        message: 'Folder created successfully',
        folderId: folderId,
      });
      expect(driveService.createFolder).toHaveBeenCalledWith(folderName);
    });

    it('should throw BadRequestException when folder creation fails', async () => {
      const folderName = 'test-folder';

      driveService.createFolder.mockRejectedValue(new Error('Creation failed'));

      await expect(controller.createFolder(folderName)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('checkIfFolderExists', () => {
    it('should return true when folder exists', async () => {
      const folderName = 'existing-folder';

      driveService.folderExists.mockResolvedValue(true);

      const result = await controller.checkIfFolderExists(folderName);

      expect(result).toBe(true);
      expect(driveService.folderExists).toHaveBeenCalledWith(folderName);
    });

    it('should return false when folder does not exist', async () => {
      const folderName = 'non-existing-folder';

      driveService.folderExists.mockResolvedValue(false);

      const result = await controller.checkIfFolderExists(folderName);

      expect(result).toBe(false);
      expect(driveService.folderExists).toHaveBeenCalledWith(folderName);
    });

    it('should throw BadRequestException when check fails', async () => {
      const folderName = 'test-folder';

      driveService.folderExists.mockRejectedValue(new Error('Check failed'));

      await expect(controller.checkIfFolderExists(folderName)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getAuthUrl', () => {
    it('should return auth URL successfully', () => {
      const authUrl = 'https://accounts.google.com/oauth/authorize?...';

      driveService.getAuthUrl.mockReturnValue(authUrl);

      const result = controller.getAuthUrl();

      expect(result).toEqual({ authUrl });
      expect(driveService.getAuthUrl).toHaveBeenCalled();
    });

    it('should throw BadRequestException when auth URL generation fails', () => {
      driveService.getAuthUrl.mockImplementation(() => {
        throw new Error('Auth URL generation failed');
      });

      expect(() => controller.getAuthUrl()).toThrow(BadRequestException);
    });
  });

  describe('handleOAuthCallback', () => {
    it('should handle OAuth callback successfully', async () => {
      const code = 'auth_code_123';

      driveService.setCredentials.mockResolvedValue(undefined);

      const result = await controller.handleOAuthCallback(code);

      expect(result).toEqual({
        success: true,
        message: 'Authentication successful',
      });
      expect(driveService.setCredentials).toHaveBeenCalledWith(code);
    });

    it('should throw BadRequestException when OAuth callback fails', async () => {
      const code = 'invalid_code';

      driveService.setCredentials.mockRejectedValue(new Error('Invalid code'));

      await expect(controller.handleOAuthCallback(code)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('isFolderExists', () => {
    it('should return true when folder exists', async () => {
      const folderName = 'existing-folder';

      driveService.folderExists.mockResolvedValue(true);

      const result = await controller.isFolderExists(folderName);

      expect(result).toBe(true);
      expect(driveService.folderExists).toHaveBeenCalledWith(folderName);
    });

    it('should return false when folder does not exist', async () => {
      const folderName = 'non-existing-folder';

      driveService.folderExists.mockResolvedValue(false);

      const result = await controller.isFolderExists(folderName);

      expect(result).toBe(false);
      expect(driveService.folderExists).toHaveBeenCalledWith(folderName);
    });

    it('should throw BadRequestException when check fails', async () => {
      const folderName = 'test-folder';

      driveService.folderExists.mockRejectedValue(new Error('Check failed'));

      await expect(controller.isFolderExists(folderName)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
