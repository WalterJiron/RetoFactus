import { Test, TestingModule } from '@nestjs/testing';
import { SaleDetailsService } from './sale_details.service';

describe('SaleDetailsService', () => {
  let service: SaleDetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SaleDetailsService],
    }).compile();

    service = module.get<SaleDetailsService>(SaleDetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
