import { Test, TestingModule } from '@nestjs/testing';
import {
  CreatorEditorMapController,
  AccountEditorMapController,
} from './map.controller';
import {
  CreatorEditorMapService,
  AccountEditorMapService,
} from '../../application/services/map.service';
import { CreatorEditorMapStatus } from '../../domain/enums/creator-editor-map-status.enum';

describe('CreatorEditorMapController', () => {
  let controller: CreatorEditorMapController;
  let creatorEditorMapService: jest.Mocked<CreatorEditorMapService>;

  const mockRequest = {
    user: { id: 'creator1', role: 'creator' },
  } as any;

  const mockCreatorEditorFindDto = {
    id: 'map1',
    creatorId: 'creator1',
    editorId: 'editor1',
    editorMail: 'editor@example.com',
    editorName: 'Editor Name',
    editorAvatar: 'avatar.jpg',
    status: CreatorEditorMapStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMap = {
    id: 'map1',
    creatorId: 'creator1',
    editorId: 'editor1',
    status: CreatorEditorMapStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockCreatorEditorMapService = {
      findMap: jest.fn(),
      findMapsByCreatorId: jest.fn(),
      findMapsByEditorId: jest.fn(),
      requestEditor: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreatorEditorMapController],
      providers: [
        {
          provide: CreatorEditorMapService,
          useValue: mockCreatorEditorMapService,
        },
      ],
    }).compile();

    controller = module.get<CreatorEditorMapController>(
      CreatorEditorMapController,
    );
    creatorEditorMapService = module.get(CreatorEditorMapService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findMap', () => {
    it('should find a map by creator and editor email', async () => {
      const editorMail = 'editor@example.com';

      creatorEditorMapService.findMap.mockResolvedValue(
        mockCreatorEditorFindDto,
      );

      const result = await controller.findMap(mockRequest, editorMail);

      expect(result).toEqual(mockCreatorEditorFindDto);
      expect(creatorEditorMapService.findMap).toHaveBeenCalledWith(
        'creator1',
        editorMail,
      );
    });
  });

  describe('findMapsByCreatorId', () => {
    it('should find maps by creator ID', async () => {
      const mockMaps = [mockCreatorEditorFindDto];

      creatorEditorMapService.findMapsByCreatorId.mockResolvedValue(mockMaps);

      const result = await controller.findMapsByCreatorId(mockRequest);

      expect(result).toEqual(mockMaps);
      expect(creatorEditorMapService.findMapsByCreatorId).toHaveBeenCalledWith(
        'creator1',
      );
    });
  });

  describe('findMapsByEditorId', () => {
    it('should find maps by editor ID', async () => {
      const editorRequest = {
        user: { id: 'editor1', role: 'editor' },
      } as any;
      const mockMaps = [mockCreatorEditorFindDto];

      creatorEditorMapService.findMapsByEditorId.mockResolvedValue(mockMaps);

      const result = await controller.findMapsByEditorId(editorRequest);

      expect(result).toEqual(mockMaps);
      expect(creatorEditorMapService.findMapsByEditorId).toHaveBeenCalledWith(
        'editor1',
      );
    });
  });

  describe('requestEditor', () => {
    it('should request an editor', async () => {
      const editorId = 'editor1';

      creatorEditorMapService.requestEditor.mockResolvedValue(mockMap);

      const result = await controller.requestEditor(mockRequest, editorId);

      expect(result).toEqual(mockMap);
      expect(creatorEditorMapService.requestEditor).toHaveBeenCalledWith(
        'creator1',
        editorId,
      );
    });
  });

  describe('updateEditor', () => {
    it('should update editor status', async () => {
      const mapId = 'map1';
      const status = CreatorEditorMapStatus.INACTIVE;
      const updatedMap = { ...mockMap, status };

      creatorEditorMapService.update.mockResolvedValue(updatedMap);

      const result = await controller.updateEditor(mapId, status);

      expect(result).toEqual(updatedMap);
      expect(creatorEditorMapService.update).toHaveBeenCalledWith(mapId, {
        status,
      });
    });
  });
});

describe('AccountEditorMapController', () => {
  let controller: AccountEditorMapController;
  let accountEditorMapService: jest.Mocked<AccountEditorMapService>;

  const mockRequest = {
    user: { id: 'creator1', role: 'creator' },
  } as any;

  const mockEditorRequest = {
    user: { id: 'editor1', role: 'editor' },
  } as any;

  const mockAccountEditorMap = {
    id: 'map1',
    creatorId: 'creator1',
    accountId: 'account1',
    editorId: 'editor1',
    status: 'ACTIVE' as any,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockAccountEditorMapService = {
      findAccountsByEditorId: jest.fn(),
      findAccountEditors: jest.fn(),
      linkEditorToAccount: jest.fn(),
      unlinkEditorFromAccount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountEditorMapController],
      providers: [
        {
          provide: AccountEditorMapService,
          useValue: mockAccountEditorMapService,
        },
      ],
    }).compile();

    controller = module.get<AccountEditorMapController>(
      AccountEditorMapController,
    );
    accountEditorMapService = module.get(AccountEditorMapService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAccountsByEditorId', () => {
    it('should find accounts linked to an editor', async () => {
      const mockAccounts = [mockAccountEditorMap];

      accountEditorMapService.findAccountsByEditorId.mockResolvedValue(
        mockAccounts as any,
      );

      const result = await controller.findAccountsByEditorId(mockEditorRequest);

      expect(result).toEqual(mockAccounts);
      expect(
        accountEditorMapService.findAccountsByEditorId,
      ).toHaveBeenCalledWith('editor1');
    });
  });

  describe('findAccountEditors', () => {
    it('should find account editors linked to a creator', async () => {
      const accountId = 'account1';
      const mockEditors = [mockAccountEditorMap];

      accountEditorMapService.findAccountEditors.mockResolvedValue(
        mockEditors as any,
      );

      const result = await controller.findAccountEditors(
        mockRequest,
        accountId,
      );

      expect(result).toEqual(mockEditors);
      expect(accountEditorMapService.findAccountEditors).toHaveBeenCalledWith(
        'creator1',
        accountId,
      );
    });
  });

  describe('linkEditorToAccount', () => {
    it('should link editor to account', async () => {
      const accountId = 'account1';
      const editorId = 'editor1';

      accountEditorMapService.linkEditorToAccount.mockResolvedValue(
        mockAccountEditorMap as any,
      );

      const result = await controller.linkEditorToAccount(
        mockRequest,
        accountId,
        editorId,
      );

      expect(result).toEqual(mockAccountEditorMap);
      expect(accountEditorMapService.linkEditorToAccount).toHaveBeenCalledWith(
        'creator1',
        accountId,
        editorId,
      );
    });
  });

  describe('unlinkEditorFromAccount', () => {
    it('should unlink editor from account', async () => {
      const accountId = 'account1';
      const editorId = 'editor1';
      const inactiveMap = {
        ...mockAccountEditorMap,
        status: 'INACTIVE' as any,
      };

      accountEditorMapService.unlinkEditorFromAccount.mockResolvedValue(
        inactiveMap as any,
      );

      const result = await controller.unlinkEditorFromAccount(
        mockRequest,
        accountId,
        editorId,
      );

      expect(result).toEqual(inactiveMap);
      expect(
        accountEditorMapService.unlinkEditorFromAccount,
      ).toHaveBeenCalledWith('creator1', accountId, editorId);
    });
  });
});
