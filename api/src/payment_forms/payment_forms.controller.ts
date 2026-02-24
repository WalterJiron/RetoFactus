import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PaymentFormsService } from './payment_forms.service';
import { CreatePaymentFormDto } from './dto/create-payment_form.dto';
import { UpdatePaymentFormDto } from './dto/update-payment_form.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../auth/enums/role.enum';

@Auth(Role.Vendedor, Role.Admin)
@Controller('payment-forms')
export class PaymentFormsController {
  constructor(private readonly paymentFormsService: PaymentFormsService) { }

  @Get()
  findAll() {
    return this.paymentFormsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.paymentFormsService.findOne(+id);
  }
}
