import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
// Por el momento, no son utiles
// import { CreatePaymentFormDto } from './dto/create-payment_form.dto';
// import { UpdatePaymentFormDto } from './dto/update-payment_form.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class PaymentFormsService {

  constructor(private readonly db: DataSource) { }

  async findAll() {
    const paymentForms = await this.db.query(
      `
         SELECT
            pf.IdPaymentForm,
            pf.Code,
            pf.Name,
            pf.Active,
            pf.DateCreate,
            pf.DateUpdate
        FROM PaymentForms pf
        ORDER BY pf.IdPaymentForm DESC;
      `
    );

    if (!paymentForms.length) throw new NotFoundException('Error: no se encontraron formas de pago en el sistema.');

    return paymentForms;
  }

  async findOne(id: number) {
    const paymentForm = await this.db.query(
      `
        SELECT
            pf.IdPaymentForm,
            pf.Code,
            pf.Name,
            pf.Active,
            pf.DateCreate,
            pf.DateUpdate
        FROM PaymentForms pf
        WHERE pf.IdPaymentForm = $1;
      `, [id]
    );

    if (!paymentForm.length) throw new BadRequestException(`Error: el metodo de pago con el ID ${id} no se encuentra en el sistema.`);

    return paymentForm;
  }

}
