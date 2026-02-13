import { Test, TestingModule } from '@nestjs/testing';
import { FolderService } from './folder.service';
import { IFolderPort } from '../../domain/ports/folder.port';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CreateFolderDto } from '../dtos/create-folder.dto';
import { UpdateFolderDto } from '../dtos/update-folder.dto';

describe('FolderService', () => {
  let service: FolderService;
  let folderPort: jest.Mocked<IFolderPort>;

  const mockFolder = {
    id: 'folder1',
    name: 'Test Folder 1',
    creatorId: 'creator1',
    editorId: 'editor1',
    accountId: 'account1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockFolders = [
    mockFolder,
    {
      id: 'folder2',
      name: 'Test Folder 2',
      creatorId: 'creator1',
      editorId: 'editor1',
      accountId: 'account1',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  ];

  beforeEach(async () => {
    const mockFolderPort = {
      getFoldersByCreator: jest.fn(),
      getFoldersByEditor: jest.fn(),
      createFolder: jest.fn(),
      updateFolder: jest.fn(),
      deleteFolder: jest.fn(),
      getFolderById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FolderService,
        {
          provide: IFolderPort,
          useValue: mockFolderPort,
        },
      ],
    }).compile();

    service = module.get<FolderService>(FolderService);
    folderPort = module.get(IFolderPort);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFoldersByCreator', () => {
    it('should return folders for a creator', async () => {
      folderPort.getFoldersByCreator.mockResolvedValue(mockFolders);

      const result = await service.getFoldersByCreator('creator1', 'account1');

      expect(result).toEqual(mockFolders);
      expect(folderPort.getFoldersByCreator).toHaveBeenCalledWith(
        'creator1',
        'account1',
      );
    });

    it('should throw NotFoundException when folders not found', async () => {
      folderPort.getFoldersByCreator.mockRejectedValue(new Error('Not found'));

      await expect(
        service.getFoldersByCreator('creator1', 'account1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFoldersByEditor', () => {
    it('should return folders for an editor', async () => {
      folderPort.getFoldersByEditor.mockResolvedValue(mockFolders);

      const result = await service.getFoldersByEditor('editor1', 'account1');

      expect(result).toEqual(mockFolders);
      expect(folderPort.getFoldersByEditor).toHaveBeenCalledWith(
        'editor1',
        'account1',
      );
    });

    it('should throw NotFoundException when folders not found', async () => {
      folderPort.getFoldersByEditor.mockRejectedValue(new Error('Not found'));

      await expect(
        service.getFoldersByEditor('editor1', 'account1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createFolder', () => {
    const createFolderDto: CreateFolderDto = {
      name: 'New Folder',
      creatorId: 'creator1',
      editorId: 'editor1',
      accountId: 'account1',
    };

    it('should create a folder successfully', async () => {
      folderPort.createFolder.mockResolvedValue(mockFolder);

      const result = await service.createFolder(createFolderDto);

      expect(result).toEqual(mockFolder);
      expect(folderPort.createFolder).toHaveBeenCalledWith({
        name: createFolderDto.name,
        creatorId: createFolderDto.creatorId,
        editorId: createFolderDto.editorId,
        accountId: createFolderDto.accountId,
      });
    });

    it('should throw ConflictException on duplicate name', async () => {
      const duplicateError = { code: 'P2002' };
      folderPort.createFolder.mockRejectedValue(duplicateError);

      await expect(service.createFolder(createFolderDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException on other errors', async () => {
      folderPort.createFolder.mockRejectedValue(new Error('Database error'));

      await expect(service.createFolder(createFolderDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateFolder', () => {
    const updateFolderDto: UpdateFolderDto = {
      name: 'Updated Folder',
      editorId: 'editor2',
    };

    it('should update a folder successfully', async () => {
      folderPort.getFolderById.mockResolvedValue(mockFolder);
      folderPort.updateFolder.mockResolvedValue({
        ...mockFolder,
        ...updateFolderDto,
      });

      const result = await service.updateFolder('folder1', updateFolderDto);

      expect(result).toEqual({ ...mockFolder, ...updateFolderDto });
      expect(folderPort.getFolderById).toHaveBeenCalledWith('folder1');
      expect(folderPort.updateFolder).toHaveBeenCalledWith('folder1', {
        name: updateFolderDto.name,
        editorId: updateFolderDto.editorId,
      });
    });

    it('should throw NotFoundException when folder does not exist', async () => {
      folderPort.getFolderById.mockResolvedValue(null);

      await expect(
        service.updateFolder('folder1', updateFolderDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException on duplicate name', async () => {
      folderPort.getFolderById.mockResolvedValue(mockFolder);
      const duplicateError = { code: 'P2002' };
      folderPort.updateFolder.mockRejectedValue(duplicateError);

      await expect(
        service.updateFolder('folder1', updateFolderDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException on other errors', async () => {
      folderPort.getFolderById.mockResolvedValue(mockFolder);
      folderPort.updateFolder.mockRejectedValue(new Error('Database error'));

      await expect(
        service.updateFolder('folder1', updateFolderDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteFolder', () => {
    it('should delete a folder successfully', async () => {
      folderPort.getFolderById.mockResolvedValue(mockFolder);
      folderPort.deleteFolder.mockResolvedValue();

      await service.deleteFolder('folder1');

      expect(folderPort.getFolderById).toHaveBeenCalledWith('folder1');
      expect(folderPort.deleteFolder).toHaveBeenCalledWith('folder1');
    });

    it('should throw NotFoundException when folder does not exist', async () => {
      folderPort.getFolderById.mockResolvedValue(null);

      await expect(service.deleteFolder('folder1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException on deletion error', async () => {
      folderPort.getFolderById.mockResolvedValue(mockFolder);
      folderPort.deleteFolder.mockRejectedValue(new Error('Database error'));

      await expect(service.deleteFolder('folder1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getFolderById', () => {
    it('should return a folder by ID', async () => {
      folderPort.getFolderById.mockResolvedValue(mockFolder);

      const result = await service.getFolderById('folder1');

      expect(result).toEqual(mockFolder);
      expect(folderPort.getFolderById).toHaveBeenCalledWith('folder1');
    });

    it('should throw NotFoundException when folder not found', async () => {
      folderPort.getFolderById.mockResolvedValue(null);

      await expect(service.getFolderById('folder1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
