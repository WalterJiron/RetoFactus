import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PaymentFormsService } from './payment_forms.service';
import { CreatePaymentFormDto } from './dto/create-payment_form.dto';
import { UpdatePaymentFormDto } from './dto/update-payment_form.dto';

@Controller('payment-forms')
export class PaymentFormsController {
  constructor(private readonly paymentFormsService: PaymentFormsService) {}

  @Post()
  create(@Body() createPaymentFormDto: CreatePaymentFormDto) {
    return this.paymentFormsService.create(createPaymentFormDto);
  }

  @Get()
  findAll() {
    return this.paymentFormsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentFormsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentFormDto: UpdatePaymentFormDto) {
    return this.paymentFormsService.update(+id, updatePaymentFormDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentFormsService.remove(+id);
  }
}
