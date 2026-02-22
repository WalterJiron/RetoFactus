import { Test, TestingModule } from '@nestjs/testing';
import { PaymentFormsService } from './payment_forms.service';

describe('PaymentFormsService', () => {
  let service: PaymentFormsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentFormsService],
    }).compile();

    service = module.get<PaymentFormsService>(PaymentFormsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
