import { Injectable } from '@nestjs/common';
import { CreatePaymentFormDto } from './dto/create-payment_form.dto';
import { UpdatePaymentFormDto } from './dto/update-payment_form.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class PaymentFormsService {

  constructor(private readonly db: DataSource) { }

  create(createPaymentFormDto: CreatePaymentFormDto) {
    return 'This action adds a new paymentForm';
  }

  findAll() {
    return `This action returns all paymentForms`;
  }

  findOne(id: number) {
    return `This action returns a #${id} paymentForm`;
  }

  update(id: number, updatePaymentFormDto: UpdatePaymentFormDto) {
    return `This action updates a #${id} paymentForm`;
  }

  remove(id: number) {
    return `This action removes a #${id} paymentForm`;
  }
}
