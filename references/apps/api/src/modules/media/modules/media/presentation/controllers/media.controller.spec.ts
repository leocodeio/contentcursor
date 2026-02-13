// import { Test, TestingModule } from '@nestjs/testing';
// import { BadRequestException } from '@nestjs/common';
// import { MediaController } from './media.controller';
// import { MediaService } from '../../application/services/media.service';
// import { CreateMediaDto } from '../../application/dtos/create-media.dto';
// import { UpdateMediaDto } from '../../application/dtos/update-media.dto';
// import { xMediaType } from '@spectral/types';

// describe('MediaController', () => {
//   let controller: MediaController;
//   let mediaService: jest.Mocked<MediaService>;

//   const mockMedia = {
//     id: 'media1',
//     type: 'IMAGE' as xMediaType,
//     url: 'https://example.com/media1.jpg',
//     name: 'test-media',
//     size: 1024,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   };

//   const mockFolderItem = {
//     id: 'folderItem1',
//     folderId: 'folder1',
//     mediaId: 'media1',
//     media: mockMedia,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   };

//   const mockRequest = {
//     user: { id: 'user1', role: 'creator' },
//   } as AuthenticatedRequest;

//   const mockFile = {
//     fieldname: 'file',
//     originalname: 'test.jpg',
//     encoding: '7bit',
//     mimetype: 'image/jpeg',
//     size: 1024,
//     buffer: Buffer.from('test'),
//   } as Express.Multer.File;

//   beforeEach(async () => {
//     const mockMediaService = {
//       findById: jest.fn(),
//       create: jest.fn(),
//       update: jest.fn(),
//       delete: jest.fn(),
//       getFolderItems: jest.fn(),
//       getFolderItem: jest.fn(),
//       deleteFolderItem: jest.fn(),
//     };

//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [MediaController],
//       providers: [
//         {
//           provide: MediaService,
//           useValue: mockMediaService,
//         },
//       ],
//     }).compile();

//     controller = module.get<MediaController>(MediaController);
//     mediaService = module.get(MediaService);
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });

//   describe('findById', () => {
//     it('should return a media by ID', async () =ggV> {
//       mediaService.findById.mockResolvedValue(mockMedia);

//       const result = await controller.findById('media1');

//       expect(result).toEqual(mockMedia);
//       expect(mediaService.findById).toHaveBeenCalledWith('media1');
//     });
//   });

//   describe('create', () => {
//     it('should create media successfully', async () => {
//       const createMediaDto: CreateMediaDto = {
//         type: MediaType.IMAGE,
//         folderId: 'folder1',
//       };

//       mediaService.create.mockResolvedValue(mockMedia);

//       const result = await controller.create(
//         createMediaDto,
//         mockFile,
//         mockRequest,
//       );

//       expect(result).toEqual(mockMedia);
//       expect(mediaService.create).toHaveBeenCalledWith(
//         createMediaDto,
//         mockFile,
//         'user1',
//       );
//     });

//     it('should throw BadRequestException when no file is uploaded', async () => {
//       const createMediaDto: CreateMediaDto = {
//         type: MediaType.IMAGE,
//         folderId: 'folder1',
//       };

//       await expect(
//         controller.create(createMediaDto, null as any, mockRequest),
//       ).rejects.toThrow(BadRequestException);
//       await expect(
//         controller.create(createMediaDto, null as any, mockRequest),
//       ).rejects.toThrow('No file uploaded');
//     });
//   });

//   describe('update', () => {
//     it('should update media successfully', async () => {
//       const updateMediaDto: UpdateMediaDto = {
//         type: MediaType.VIDEO,
//         folderId: 'folder2',
//       };

//       const updatedMedia = { ...mockMedia, ...updateMediaDto };
//       mediaService.update.mockResolvedValue(updatedMedia);

//       const result = await controller.update('media1', updateMediaDto);

//       expect(result).toEqual(updatedMedia);
//       expect(mediaService.update).toHaveBeenCalledWith(
//         'media1',
//         updateMediaDto,
//       );
//     });
//   });

//   describe('delete', () => {
//     it('should delete media successfully', async () => {
//       mediaService.delete.mockResolvedValue(undefined);

//       await controller.delete('media1');

//       expect(mediaService.delete).toHaveBeenCalledWith('media1');
//     });
//   });

//   describe('getFolderItems', () => {
//     it('should return folder items', async () => {
//       mediaService.getFolderItems.mockResolvedValue([mockFolderItem]);

//       const result = await controller.getFolderItems('folder1');

//       expect(result).toEqual([mockFolderItem]);
//       expect(mediaService.getFolderItems).toHaveBeenCalledWith('folder1');
//     });
//   });

//   describe('getFolderItem', () => {
//     it('should return a specific folder item', async () => {
//       mediaService.getFolderItem.mockResolvedValue(mockFolderItem);

//       const result = await controller.getFolderItem('folder1', 'media1');

//       expect(result).toEqual(mockFolderItem);
//       expect(mediaService.getFolderItem).toHaveBeenCalledWith(
//         'folder1',
//         'media1',
//       );
//     });
//   });

//   describe('deleteFolderItem', () => {
//     it('should delete folder item successfully', async () => {
//       mediaService.deleteFolderItem.mockResolvedValue(undefined);

//       await controller.deleteFolderItem('folder1', 'media1');

//       expect(mediaService.deleteFolderItem).toHaveBeenCalledWith(
//         'folder1',
//         'media1',
//       );
//     });
//   });
// });
