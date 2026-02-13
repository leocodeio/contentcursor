import { Test, TestingModule } from '@nestjs/testing';
import { FolderController } from './folder.controller';
import { FolderService } from '../../application/services/folder.service';
import {
  CreateFolderByCreatorDto,
  CreateFolderByEditorDto,
} from '../../application/dtos/create-folder.dto';
import { UpdateFolderDto } from '../../application/dtos/update-folder.dto';

describe('FolderController', () => {
  let controller: FolderController;
  let folderService: jest.Mocked<FolderService>;

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

  const mockFolders = [mockFolder];

  const mockRequest = {
    user: { id: 'user1', role: 'creator' },
  } as AuthenticatedRequest;

  beforeEach(async () => {
    const mockFolderService = {
      getFoldersByCreator: jest.fn(),
      getFoldersByEditor: jest.fn(),
      createFolder: jest.fn(),
      updateFolder: jest.fn(),
      deleteFolder: jest.fn(),
      getFolderById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FolderController],
      providers: [
        {
          provide: FolderService,
          useValue: mockFolderService,
        },
      ],
    }).compile();

    controller = module.get<FolderController>(FolderController);
    folderService = module.get(FolderService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getFoldersByCreator', () => {
    it('should return folders for a creator', async () => {
      folderService.getFoldersByCreator.mockResolvedValue(mockFolders);

      const result = await controller.getFoldersByCreator(
        mockRequest,
        'account1',
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockFolder.id,
        name: mockFolder.name,
        creatorId: mockFolder.creatorId,
        editorId: mockFolder.editorId,
        accountId: mockFolder.accountId,
        createdAt: mockFolder.createdAt,
        updatedAt: mockFolder.updatedAt,
      });
      expect(folderService.getFoldersByCreator).toHaveBeenCalledWith(
        'user1',
        'account1',
      );
    });
  });

  describe('getFoldersByEditor', () => {
    it('should return folders for an editor', async () => {
      folderService.getFoldersByEditor.mockResolvedValue(mockFolders);

      const result = await controller.getFoldersByEditor(
        mockRequest,
        'account1',
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockFolder.id,
        name: mockFolder.name,
        creatorId: mockFolder.creatorId,
        editorId: mockFolder.editorId,
        accountId: mockFolder.accountId,
        createdAt: mockFolder.createdAt,
        updatedAt: mockFolder.updatedAt,
      });
      expect(folderService.getFoldersByEditor).toHaveBeenCalledWith(
        'user1',
        'account1',
      );
    });
  });

  describe('createFolderByCreator', () => {
    it('should create a folder successfully', async () => {
      const createFolderDto: CreateFolderByCreatorDto = {
        name: 'New Folder',
        editorId: 'editor1',
        accountId: 'account1',
      };

      folderService.createFolder.mockResolvedValue(mockFolder);

      const result = await controller.createFolderByCreator(
        createFolderDto,
        mockRequest,
      );

      expect(result).toEqual({
        id: mockFolder.id,
        name: mockFolder.name,
        creatorId: mockFolder.creatorId,
        editorId: mockFolder.editorId,
        accountId: mockFolder.accountId,
        createdAt: mockFolder.createdAt,
        updatedAt: mockFolder.updatedAt,
      });
      expect(folderService.createFolder).toHaveBeenCalledWith({
        name: createFolderDto.name,
        editorId: createFolderDto.editorId,
        accountId: createFolderDto.accountId,
        creatorId: 'user1',
      });
    });
  });

  describe('createFolderByEditor', () => {
    it('should create a folder successfully', async () => {
      const createFolderDto: CreateFolderByEditorDto = {
        name: 'New Folder',
        creatorId: 'creator1',
        accountId: 'account1',
      };

      const mockRequestEditor = {
        user: { id: 'user2', role: 'editor' },
      } as AuthenticatedRequest;

      folderService.createFolder.mockResolvedValue(mockFolder);

      const result = await controller.createFolderByEditor(
        createFolderDto,
        mockRequestEditor,
      );

      expect(result).toEqual({
        id: mockFolder.id,
        name: mockFolder.name,
        creatorId: mockFolder.creatorId,
        editorId: mockFolder.editorId,
        accountId: mockFolder.accountId,
        createdAt: mockFolder.createdAt,
        updatedAt: mockFolder.updatedAt,
      });
      expect(folderService.createFolder).toHaveBeenCalledWith({
        name: createFolderDto.name,
        creatorId: createFolderDto.creatorId,
        accountId: createFolderDto.accountId,
        editorId: 'user2',
      });
    });
  });

  describe('updateFolder', () => {
    it('should update a folder successfully', async () => {
      const updateFolderDto: UpdateFolderDto = {
        name: 'Updated Folder',
        editorId: 'editor2',
      };

      const updatedFolder = { ...mockFolder, ...updateFolderDto };
      folderService.updateFolder.mockResolvedValue(updatedFolder);

      const result = await controller.updateFolder('folder1', updateFolderDto);

      expect(result).toEqual({
        id: updatedFolder.id,
        name: updatedFolder.name,
        creatorId: updatedFolder.creatorId,
        editorId: updatedFolder.editorId,
        accountId: updatedFolder.accountId,
        createdAt: updatedFolder.createdAt,
        updatedAt: updatedFolder.updatedAt,
      });
      expect(folderService.updateFolder).toHaveBeenCalledWith(
        'folder1',
        updateFolderDto,
      );
    });
  });

  describe('deleteFolder', () => {
    it('should delete a folder successfully', async () => {
      folderService.deleteFolder.mockResolvedValue(true);

      await controller.deleteFolder('folder1', mockRequest);

      expect(folderService.deleteFolder).toHaveBeenCalledWith('folder1');
    });
  });

  describe('getFolderById', () => {
    it('should return a folder by ID', async () => {
      folderService.getFolderById.mockResolvedValue(mockFolder);

      const result = await controller.getFolderById('folder1');

      expect(result).toEqual({
        id: mockFolder.id,
        name: mockFolder.name,
        creatorId: mockFolder.creatorId,
        editorId: mockFolder.editorId,
        accountId: mockFolder.accountId,
        createdAt: mockFolder.createdAt,
        updatedAt: mockFolder.updatedAt,
      });
      expect(folderService.getFolderById).toHaveBeenCalledWith('folder1');
    });
  });
});
