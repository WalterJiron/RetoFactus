import { Module } from '@nestjs/common';
import { PaymentFormsService } from './payment_forms.service';
import { PaymentFormsController } from './payment_forms.controller';
import { DatabaseModule } from '../connection/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PaymentFormsController],
  providers: [PaymentFormsService],
})
export class PaymentFormsModule { }
