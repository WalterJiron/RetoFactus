import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../auth/enums/role.enum';
import { DataSource } from 'typeorm';
import { ResponseValidation } from '../utils/ResponseValidations';

@Auth(Role.Admin)
@Injectable()
export class ProductsService {

  constructor(private readonly db: DataSource) { }

  @Auth(Role.Vendedor)
  async create(
    {
      codeReference, nameProduct, description,
      idSubCategory, stock, measurementUnit,
    }: CreateProductDto) {
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

    return ResponseValidation.forMessage(result, "correctamente");
  }

  @Auth(Role.Vendedor)
  async findAll() {
    const products = await this.db.query(
      `
        SELECT
          p.IdProduct,
          p.code_reference,
          p.NameProduct,
          p.Description as ProductDescription,
          p.Stock,
          p.MeasurementUnit,
          p.Active as ProductActive,
          p.DateCreate as ProductDateCreate,
          sc.IdSubCategory,
          sc.NameSubCategory,
          sc.Description as SubCategoryDescription,
          sc.Active as SubCategoryActive,
          c.IdCategory,
          c.NameCategory,
          c.Description as CategoryDescription,
          c.Active as CategoryActive,
          COALESCE(dp.PurchasePrice, 0) as PurchasePrice,
          COALESCE(dp.SalePrice, 0) as SalePrice,
          COALESCE(dp.MinStock, 0) as MinStock,
          p.DateCreate, p.DateUpdate, p.DateDelete,
          p.Active
        FROM Product p
        INNER JOIN SubCategory sc 
          ON p.IdSubCategory = sc.IdSubCategory
        INNER JOIN Category c 
          ON sc.CategorySub = c.IdCategory
        LEFT JOIN DetailProduct dp 
          ON p.IdProduct = dp.IdProduct AND dp.Active = true
        ORDER BY p.IdProduct DESC;
      `
    );

    if (!products.length) throw new NotFoundException('Error no hay productos en el sistema');

    return products;
  }

  @Auth(Role.Vendedor)
  async findOne(id: number) {
    const product = await this.db.query(
      `
        SELECT
          p.IdProduct,
          p.code_reference,
          p.NameProduct,
          p.Description as ProductDescription,
          p.Stock,
          p.MeasurementUnit,
          p.Active as ProductActive,
          p.DateCreate as ProductDateCreate,
          sc.IdSubCategory,
          sc.NameSubCategory,
          sc.Description as SubCategoryDescription,
          sc.Active as SubCategoryActive,
          c.IdCategory,
          c.NameCategory,
          c.Description as CategoryDescription,
          c.Active as CategoryActive,
          COALESCE(dp.PurchasePrice, 0) as PurchasePrice,
          COALESCE(dp.SalePrice, 0) as SalePrice,
          COALESCE(dp.MinStock, 0) as MinStock,
          p.DateCreate, p.DateUpdate, p.DateDelete,
          p.Active
        FROM Product p
        INNER JOIN SubCategory sc
          ON p.IdSubCategory = sc.IdSubCategory
        INNER JOIN Category c
          ON sc.CategorySub = c.IdCategory
        LEFT JOIN DetailProduct dp
          ON p.IdProduct = dp.IdProduct AND dp.Active = true
        WHERE p.IdProduct = $1
      `, [id]
    );

    if (!product.length) throw new BadRequestException(`Error el usuario con el ID ${id} no existe en el sistema.`);

    return product;
  }

  @Auth(Role.Vendedor)
  async update(
    id: number,
    {
      codeReference, nameProduct, description,
      idSubCategory, stock, measurementUnit,
    }: UpdateProductDto
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

    return ResponseValidation.forMessage(result, "correctamente");
  }

  async remove(id: number) {
    const result = await this.db.query(
      `
        SELECT delete_product($1) AS message;
      `, [id]
    );

    if (!result.length) throw new BadRequestException(`Error al eliminar el producto con el ID: ${id}`);

    return ResponseValidation.forMessage(result, "correctamente")
  }

  async restore(id: number) {
    const result = await this.db.query(
      `
        SELECT restore_product($1) AS message;
      `, [id]
    );

    if (!result.length) throw new BadRequestException(`Error al restaurar el producto con el ID: ${id}`);

    return ResponseValidation.forMessage(result, "correctamente");
  }
}
