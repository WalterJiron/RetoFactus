import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ResponseValidation } from '../utils/ResponseValidations';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { UpdateSaleStatusDto } from './dto/update-sale-status.dto';

@Injectable()
export class SalesService {
  constructor(private readonly db: DataSource) {}

  async create(createSaleDto: CreateSaleDto, estId: number) {
    const result = await this.db.query(
      `
        SELECT create_sale($1, $2, $3, $4, $5) AS message;
      `,
      [
        estId,
        createSaleDto.customerId,
        createSaleDto.paymentFormId,
        JSON.stringify(createSaleDto.details),
        createSaleDto.saleDate ?? new Date(),
      ],
    );

    if (!result.length)
      throw new BadRequestException('Error interno al crear la venta.');

    return ResponseValidation.forMessage(result, 'correctamente');
  }

  async findAll(estId: number) {
    const sales = await this.db.query(
      `
        SELECT
          s.IdInternal              AS id,
          s.ReferenceCode           AS reference_code,
          -- Establecimiento
          s.EstablishmentId         AS establishment_id,
          e.Name                    AS establishment_name,
          -- Cliente
          s.CustomerId              AS customer_id,
          c.Names                   AS customer_name,
          c.Identification          AS customer_identification,
          c.Email                   AS customer_email,
          c.Phone                   AS customer_phone,
          -- Forma de pago
          s.PaymentFormId           AS payment_form_id,
          pf.Code                   AS payment_form_code,
          pf.Name                   AS payment_form_name,
          -- Fecha y totales
          s.SaleDate                AS sale_date,
          s.Subtotal                AS subtotal,
          s.TaxTotal                AS tax_total,
          s.Total                   AS total,
          s.Status                  AS status,
          -- Contadores derivados
          (
            SELECT COUNT(*)
            FROM SaleDetails sd
            WHERE sd.SaleId = s.IdInternal
              AND sd.DateDelete IS NULL
          )                         AS details_count,
          (
            SELECT COUNT(*)
            FROM Receipt r
            WHERE r.IdSale = s.IdInternal
          )                         AS receipts_count,
          -- Auditoria
          s.DateCreate              AS date_create,
          s.DateUpdate              AS date_update,
          s.DateDelete              AS date_delete,
          s.Active                  AS active
        FROM Sale s
        INNER JOIN Establishments e  ON s.EstablishmentId = e.IdEstablishment
        INNER JOIN Customers c       ON s.CustomerId      = c.IdCustomer
        INNER JOIN PaymentForms pf   ON s.PaymentFormId   = pf.IdPaymentForm
        WHERE s.EstablishmentId = $1
        ORDER BY s.IdInternal DESC;
      `,
      [estId],
    );

    if (!sales.length)
      throw new NotFoundException(
        'No hay ventas registradas para este establecimiento.',
      );

    return sales;
  }

  async findOne(id: number, estId: number) {
    // Cabecera de la venta con información completa de relaciones
    const sale = await this.db.query(
      `
        SELECT
          s.IdInternal              AS id,
          s.ReferenceCode           AS reference_code,
          -- Establecimiento
          s.EstablishmentId         AS establishment_id,
          e.Name                    AS establishment_name,
          e.Address                 AS establishment_address,
          e.Email                   AS establishment_email,
          e.Phone_Number            AS establishment_phone,
          -- Cliente
          s.CustomerId              AS customer_id,
          c.Names                   AS customer_name,
          c.Identification          AS customer_identification,
          c.Email                   AS customer_email,
          c.Phone                   AS customer_phone,
          c.Address                 AS customer_address,
          -- Forma de pago
          s.PaymentFormId           AS payment_form_id,
          pf.Code                   AS payment_form_code,
          pf.Name                   AS payment_form_name,
          -- Fecha y totales
          s.SaleDate                AS sale_date,
          s.Subtotal                AS subtotal,
          s.TaxTotal                AS tax_total,
          s.Total                   AS total,
          s.Status                  AS status,
          -- Auditoria
          s.DateCreate              AS date_create,
          s.DateUpdate              AS date_update,
          s.DateDelete              AS date_delete,
          s.Active                  AS active
        FROM Sale s
        INNER JOIN Establishments e  ON s.EstablishmentId = e.IdEstablishment
        INNER JOIN Customers c       ON s.CustomerId      = c.IdCustomer
        INNER JOIN PaymentForms pf   ON s.PaymentFormId   = pf.IdPaymentForm
        WHERE s.EstablishmentId = $1
          AND s.IdInternal = $2;
      `,
      [estId, id],
    );

    if (!sale.length)
      throw new NotFoundException(
        `La venta con el ID ${id} no existe en el sistema.`,
      );

    // Líneas de detalle con información completa del producto y su jerarquía
    const details = await this.db.query(
      `
        SELECT
          sd.IdDetail               AS id_detail,
          sd.SaleId                 AS sale_id,
          -- Producto
          sd.ProductId              AS product_id,
          p.code_reference          AS product_code,
          p.NameProduct             AS product_name,
          p.Description             AS product_description,
          p.MeasurementUnit         AS product_measurement_unit,
          p.Stock                   AS product_current_stock,
          -- Subcategoria
          sc.IdSubCategory          AS sub_category_id,
          sc.NameSubCategory        AS sub_category_name,
          -- Categoria
          cat.IdCategory            AS category_id,
          cat.NameCategory          AS category_name,
          -- Valores del detalle
          sd.Quantity               AS quantity,
          sd.UnitPrice              AS unit_price,
          sd.DiscountRate           AS discount_rate,
          sd.Subtotal               AS subtotal,
          sd.TaxRate                AS tax_rate,
          sd.TributeId              AS tribute_id,
          sd.IsExcluded             AS is_excluded,
          sd.UnitMeasureId          AS unit_measure_id,
          -- Auditoria del detalle
          sd.DateCreate             AS date_create,
          sd.DateUpdate             AS date_update
        FROM SaleDetails sd
        INNER JOIN Product p        ON sd.ProductId    = p.IdProduct
        INNER JOIN SubCategory sc   ON p.IdSubCategory = sc.IdSubCategory
        INNER JOIN Category cat     ON sc.CategorySub  = cat.IdCategory
        WHERE sd.SaleId = $1
          AND sd.Active = true
        ORDER BY sd.IdDetail ASC;
      `,
      [id],
    );

    // Recibos asociados a la venta
    const receipts = await this.db.query(
      `
        SELECT
          r.IdReceipt               AS id_receipt,
          r.NameReceipt             AS name_receipt,
          r.NaneSale                AS name_sale,
          r.public_url              AS public_url,
          r.DateCreate              AS date_create
        FROM Receipt r
        WHERE r.IdSale = $1
        ORDER BY r.IdReceipt ASC;
      `,
      [id],
    );

    return {
      ...sale[0],
      details,
      receipts,
    };
  }

  async update(id: number, updateSaleDto: UpdateSaleDto, estId: number) {
    await this.validateSaleOwnership(id, estId);

    const result = await this.db.query(
      `
        SELECT update_sale($1, $2, $3, $4, $5) AS message;
      `,
      [
        id,
        updateSaleDto.customerId ?? null,
        updateSaleDto.paymentFormId ?? null,
        updateSaleDto.saleDate ?? null,
        updateSaleDto.details ? JSON.stringify(updateSaleDto.details) : null,
      ],
    );

    if (!result.length)
      throw new BadRequestException('Error interno al actualizar la venta.');

    return ResponseValidation.forMessage(result, 'correctamente');
  }

  async updateStatus(
    id: number,
    { status }: UpdateSaleStatusDto,
    estId: number,
  ) {
    await this.validateSaleOwnership(id, estId);

    const result = await this.db.query(
      `
        SELECT update_sale_status($1, $2) AS message;
      `,
      [id, status],
    );

    if (!result.length)
      throw new BadRequestException(
        'Error interno al cambiar el estado de la venta.',
      );

    return ResponseValidation.forMessage(result, 'correctamente');
  }

  async remove(id: number, estId: number) {
    await this.validateSaleOwnership(id, estId);

    const result = await this.db.query(
      `
        SELECT delete_sale($1) AS message;
      `,
      [id],
    );

    if (!result.length)
      throw new BadRequestException('Error interno al eliminar la venta.');

    return ResponseValidation.forMessage(result, 'correctamente');
  }

  async restore(id: number, estId: number) {
    await this.validateSaleOwnership(id, estId);

    const result = await this.db.query(
      `
        SELECT restore_sale($1) AS message;
      `,
      [id],
    );

    if (!result.length)
      throw new BadRequestException('Error interno al restaurar la venta.');

    return ResponseValidation.forMessage(result, 'correctamente');
  }

  /**
   * Valida que la venta con el ID dado pertenece al establecimiento indicado.
   * Lanza BadRequestException si no existe o no pertenece al establecimiento.
   */
  private async validateSaleOwnership(
    saleId: number,
    estId: number,
  ): Promise<void> {
    const sale = await this.db.query(
      `
        SELECT IdInternal
        FROM Sale
        WHERE IdInternal = $1
          AND EstablishmentId = $2;
      `,
      [saleId, estId],
    );

    if (!sale.length)
      throw new BadRequestException(
        `La venta con el ID ${saleId} no existe o no pertenece a este establecimiento.`,
      );
  }
}
