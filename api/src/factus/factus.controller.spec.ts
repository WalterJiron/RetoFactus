import { Test, TestingModule } from '@nestjs/testing';
import { FactusController } from './factus.controller';
import { FactusService } from './factus.service';

describe('FactusController', () => {
  let controller: FactusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FactusController],
      providers: [FactusService],
    }).compile();

    controller = module.get<FactusController>(FactusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
