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
  constructor(private readonly db: DataSource) { }

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
          s.Active                  AS active,
          -- Productos embebidos
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id_detail', sd.IdDetail,
                  'sale_id', sd.SaleId,
                  'product_id', sd.ProductId,
                  'product_code', p.code_reference,
                  'product_name', p.NameProduct,
                  'product_description', p.Description,
                  'product_measurement_unit', p.MeasurementUnit,
                  'product_current_stock', p.Stock,
                  'sub_category_id', sc.IdSubCategory,
                  'sub_category_name', sc.NameSubCategory,
                  'category_id', cat.IdCategory,
                  'category_name', cat.NameCategory,
                  'quantity', sd.Quantity,
                  'unit_price', sd.UnitPrice,
                  'discount_rate', sd.DiscountRate,
                  'subtotal', sd.Subtotal,
                  'tax_rate', sd.TaxRate,
                  'tribute_id', sd.TributeId,
                  'is_excluded', sd.IsExcluded,
                  'unit_measure_id', sd.UnitMeasureId,
                  'date_create', sd.DateCreate,
                  'date_update', sd.DateUpdate
                ) ORDER BY sd.IdDetail ASC
              )
              FROM SaleDetails sd
              LEFT JOIN Product p        ON sd.ProductId    = p.IdProduct
              LEFT JOIN SubCategory sc   ON p.IdSubCategory = sc.IdSubCategory
              LEFT JOIN Category cat     ON sc.CategorySub  = cat.IdCategory
              WHERE sd.SaleId = s.IdInternal
                AND sd.DateDelete IS NULL
            ),
            '[]'::json
          ) AS details,
          -- Recibos embebidos
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id_receipt', r.IdReceipt,
                  'name_receipt', r.NameReceipt,
                  'name_sale', r.NaneSale,
                  'public_url', r.public_url,
                  'date_create', r.DateCreate
                ) ORDER BY r.IdReceipt ASC
              )
              FROM Receipt r
              WHERE r.IdSale = s.IdInternal
            ),
            '[]'::json
          ) AS receipts
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
    // Cabecera de la venta con información completa de relaciones, items y recibos
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
          s.Active                  AS active,
          -- Productos (Items)
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id_detail', sd.IdDetail,
                  'sale_id', sd.SaleId,
                  'product_id', sd.ProductId,
                  'product_code', p.code_reference,
                  'product_name', p.NameProduct,
                  'product_description', p.Description,
                  'product_measurement_unit', p.MeasurementUnit,
                  'product_current_stock', p.Stock,
                  'sub_category_id', sc.IdSubCategory,
                  'sub_category_name', sc.NameSubCategory,
                  'category_id', cat.IdCategory,
                  'category_name', cat.NameCategory,
                  'quantity', sd.Quantity,
                  'unit_price', sd.UnitPrice,
                  'discount_rate', sd.DiscountRate,
                  'subtotal', sd.Subtotal,
                  'tax_rate', sd.TaxRate,
                  'tribute_id', sd.TributeId,
                  'is_excluded', sd.IsExcluded,
                  'unit_measure_id', sd.UnitMeasureId,
                  'date_create', sd.DateCreate,
                  'date_update', sd.DateUpdate
                ) ORDER BY sd.IdDetail ASC
              )
              FROM SaleDetails sd
              LEFT JOIN Product p        ON sd.ProductId    = p.IdProduct
              LEFT JOIN SubCategory sc   ON p.IdSubCategory = sc.IdSubCategory
              LEFT JOIN Category cat     ON sc.CategorySub  = cat.IdCategory
              WHERE sd.SaleId = s.IdInternal
                AND sd.DateDelete IS NULL
            ),
            '[]'::json
          ) AS details,
          -- Recibos
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id_receipt', r.IdReceipt,
                  'name_receipt', r.NameReceipt,
                  'name_sale', r.NaneSale,
                  'public_url', r.public_url,
                  'date_create', r.DateCreate
                ) ORDER BY r.IdReceipt ASC
              )
              FROM Receipt r
              WHERE r.IdSale = s.IdInternal
            ),
            '[]'::json
          ) AS receipts
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

    return sale[0];
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
