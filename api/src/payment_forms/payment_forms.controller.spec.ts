import { Test, TestingModule } from '@nestjs/testing';
import { PaymentFormsController } from './payment_forms.controller';
import { PaymentFormsService } from './payment_forms.service';

describe('PaymentFormsController', () => {
  let controller: PaymentFormsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentFormsController],
      providers: [PaymentFormsService],
    }).compile();

    controller = module.get<PaymentFormsController>(PaymentFormsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
