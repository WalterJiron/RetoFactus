import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, NumericType } from 'typeorm';
import { ResponseValidation } from '../utils/ResponseValidations';
import { CreateProductFullDto } from './dto/create-product-full.dto';
import { UpdateProductFullDto } from './dto/update-product-full.dto';
import { CreateProductDetailsDto } from './dto/create-prodestDetails.dto';

@Injectable()
export class ProductsService {

  constructor(private readonly db: DataSource) { }


  async create(
    estId: number,
    { codeReference, nameProduct, description,
      idSubCategory, stock, measurementUnit, minStock, purchasePrice, salePrice }: CreateProductFullDto
  ) {
    const result = await this.db.query(
      `
        SELECT create_product($1,$2,$3,$4,$5,$6) AS message;
      `,
      [
        codeReference, nameProduct, description,
        idSubCategory, stock, measurementUnit,
      ]
    );

    if (!result.length) throw new BadRequestException('Error al crear el producto.');

    const product = ResponseValidation.forMessage(result, "correctamente");
    if (product.status !== 200) return product;

    const idProduct = await this.db.query(
      `
        SELECT IdProduct FROM Product ORDER BY IdProduct DESC LIMIT 1;
      `
    );

    const resultDetails = await this.db.query(
      `
        SELECT create_detailproduct($1, $2, $3, $4) AS message;
      `,
      [idProduct[0].idproduct, minStock, purchasePrice, salePrice]
    );

    if (!resultDetails.length) throw new BadRequestException('Error al crear el detalle del producto.');

    const productDetail = ResponseValidation.forMessage(resultDetails, "correctamente");
    if (productDetail.status !== 200) return productDetail;

    await this.db.query(
      `
        INSERT INTO ProductEstablishments(IdEstablishment, IdProduct)
        VALUES ($1, $2)
      `, [estId, idProduct]
    )


    return product;
  }

  async createDetail(idProduct: number,
    { minStock, purchasePrice, salePrice }:
      CreateProductDetailsDto
  ) {

    const result = await this.db.query(
      `
        SELECT create_detailproduct($1, $2, $3, $4) AS message;
      `,
      [idProduct, minStock, purchasePrice, salePrice]
    );

    if (!result.length) throw new BadRequestException('Error al crear el detalle del producto.');

    return ResponseValidation.forMessage(result, "correctamente");
  }

  async findAll(estId: number) {
    console.log(estId)

    const products = await this.db.query(
      `
        SELECT
          p.IdProduct,
          p.code_reference,
          p.NameProduct,
          p.Description AS ProductDescription,
          p.Stock,
          p.MeasurementUnit,
          sc.IdSubCategory,
          sc.NameSubCategory,
          sc.Description AS SubCategoryDescription,
          sc.Active AS SubCategoryActive,
          c.IdCategory,
          c.NameCategory,
          c.Description AS CategoryDescription,
          c.Active AS CategoryActive,
          dp.iddetailproduct,
          COALESCE(dp.PurchasePrice, 0) AS PurchasePrice,
          COALESCE(dp.SalePrice, 0) AS SalePrice,
          COALESCE(dp.MinStock, 0) AS MinStock,
          p.DateCreate,
          p.DateUpdate,
          p.DateDelete,
          p.Active
        FROM Product p
        INNER JOIN SubCategory sc
          ON p.IdSubCategory = sc.IdSubCategory
        INNER JOIN Category c
          ON sc.CategorySub = c.IdCategory
        LEFT JOIN DetailProduct dp
          ON p.IdProduct = dp.IdProduct AND dp.Active = true
        LEFT JOIN ProductEstablishments pe
          ON p.IdProduct = pe.IdProduct 
        WHERE pe.IdEstablishment = $1
        ORDER BY p.IdProduct DESC;
      `, [estId]
    );

    if (!products.length) throw new NotFoundException('Error no hay productos en el sistema');

    return products;
  }

  async findOne(estId: number, id: number) {
    const product = await this.db.query(
      `
       SELECT
          p.IdProduct,
          p.code_reference,
          p.NameProduct,
          p.Description AS ProductDescription,
          p.Stock,
          p.MeasurementUnit,
          sc.IdSubCategory,
          sc.NameSubCategory,
          sc.Description AS SubCategoryDescription,
          sc.Active AS SubCategoryActive,
          c.IdCategory,
          c.NameCategory,
          c.Description AS CategoryDescription,
          c.Active AS CategoryActive,
          dp.iddetailproduct,
          COALESCE(dp.PurchasePrice, 0) AS PurchasePrice,
          COALESCE(dp.SalePrice, 0) AS SalePrice,
          COALESCE(dp.MinStock, 0) AS MinStock,
          p.DateCreate,
          p.DateUpdate,
          p.DateDelete,
          p.Active
        FROM Product p
        INNER JOIN SubCategory sc
          ON p.IdSubCategory = sc.IdSubCategory
        INNER JOIN Category c
          ON sc.CategorySub = c.IdCategory
        LEFT JOIN DetailProduct dp
          ON p.IdProduct = dp.IdProduct AND dp.Active = true
        INNER JOIN ProductEstablishments pe
          ON p.IdProduct = pe.IdProduct 
        WHERE pe.IdEstablishment = $1 AND p.IdProduct = $2;
      `, [estId, id]
    );

    if (!product.length) throw new BadRequestException(`Error el producto con el ID ${id} no existe en el sistema.`);

    return product;
  }

  async update(
    id: number,
    {
      codeReference, nameProduct, description,
      idSubCategory, stock, measurementUnit,
      idDetail, minStock, purchasePrice, salePrice }: UpdateProductFullDto
  ) {
    const result = await this.db.query(
      `
        SELECT update_product($1,$2,$3,$4,$5,$6,$7) AS message;
      `,
      [
        id, codeReference, nameProduct, description,
        idSubCategory, stock, measurementUnit
      ]
    );

    if (!result.length) throw new BadRequestException(`Error al actualizar el producto con el ID ${id}`);

    const updateProduct = ResponseValidation.forMessage(result, "correctamente");
    if (updateProduct.status !== 200) return updateProduct;

    const resultDetail = await this.db.query(
      `
        SELECT update_detailproduct($1, $2, $3, $4) AS messagel;
      `,
      [
        idDetail, minStock, purchasePrice, salePrice
      ]
    );

    if (!resultDetail.length) throw new BadRequestException('Error al actualizar el detalle del producto');

    const updateDetail = ResponseValidation.forMessage(resultDetail, "correctamente");
    if (updateDetail.status !== 200) return updateDetail;

    return updateProduct;
  }

  async remove(estId: number, id: number) {
    const result = await this.db.query(
      `
        SELECT delete_product($1) AS message;
      `, [id]
    );

    if (!result.length) throw new BadRequestException(`Error al eliminar el producto con el ID: ${id}`);

    const remuve = ResponseValidation.forMessage(result, "correctamente");
    if (remuve.status !== 200) return remuve;

    await this.db.query(
      `
        UPDATE DetailProduct SET active = false WHERE IdProduct = $1
      `, [id]
    );

    await this.db.query(
      `
        UPDATE ProductEstablishments SET
          Active = FALSE
        WHERE IdEstablishment = $1 AND IdProduct = $2
      `, [estId, id]
    );

    return remuve;
  }

  async restore(estId: number, id: number) {
    const result = await this.db.query(
      `
        SELECT restore_product($1) AS message;
      `, [id]
    );

    if (!result.length) throw new BadRequestException(`Error al restaurar el producto con el ID: ${id}`);

    const restore = ResponseValidation.forMessage(result, "correctamente");
    if (restore.status !== 200) return restore;

    await this.db.query(
      `
        UPDATE DetailProduct
        SET active = true
        WHERE iddetailproduct = (
            SELECT iddetailproduct
            FROM DetailProduct
            WHERE IdProduct = $1
            ORDER BY iddetailproduct DESC
            LIMIT 1
        );
      `, [id]
    );

    await this.db.query(
      `
        UPDATE ProductEstablishments SET
          Active = FALSE
        WHERE IdEstablishment = $1 AND IdProduct = $2
      `, [estId, id]
    );

    return restore;
  }
}
