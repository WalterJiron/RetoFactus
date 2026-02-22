import { PartialType } from '@nestjs/swagger';
import { CreatePaymentFormDto } from './create-payment_form.dto';

export class UpdatePaymentFormDto extends PartialType(CreatePaymentFormDto) {}
