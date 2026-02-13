import { Test, TestingModule } from '@nestjs/testing';
import { TestController } from './test.controller';
import { TestService } from '../../application/services/test.service';

describe('TestController', () => {
  let controller: TestController;
  let testService: jest.Mocked<TestService>;

  const mockTestResult = {
    message: 'Test endpoint working!',
    timestamp: new Date(),
    data: {
      status: 'ok',
      version: '1.0.0',
    },
  };

  beforeEach(async () => {
    const mockTestService = {
      getTest: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestController],
      providers: [
        {
          provide: TestService,
          useValue: mockTestService,
        },
      ],
    }).compile();

    controller = module.get<TestController>(TestController);
    testService = module.get(TestService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTest', () => {
    it('should return test result successfully', async () => {
      testService.getTest.mockResolvedValue(mockTestResult);

      const result = await controller.getTest();

      expect(result).toEqual(mockTestResult);
      expect(testService.getTest).toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      testService.getTest.mockRejectedValue(error);

      await expect(controller.getTest()).rejects.toThrow('Service error');
      expect(testService.getTest).toHaveBeenCalled();
    });

    it('should return any type of data from service', async () => {
      const customResult = { custom: 'data', numbers: [1, 2, 3] };
      testService.getTest.mockResolvedValue(customResult);

      const result = await controller.getTest();

      expect(result).toEqual(customResult);
      expect(testService.getTest).toHaveBeenCalledTimes(1);
    });
  });
});
