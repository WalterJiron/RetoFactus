"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const ResponseValidations_1 = require("../utils/ResponseValidations");
let ProductsService = class ProductsService {
    constructor(db) {
        this.db = db;
    }
    async create({ codeReference, nameProduct, description, idSubCategory, stock, measurementUnit, minStock, purchasePrice, salePrice }) {
        const result = await this.db.query(`
        SELECT create_product($1,$2,$3,$4,$5,$6) AS message;
      `, [
            codeReference, nameProduct, description,
            idSubCategory, stock, measurementUnit,
        ]);
        if (!result.length)
            throw new common_1.BadRequestException('Error al crear el producto.');
        const product = ResponseValidations_1.ResponseValidation.forMessage(result, "correctamente");
        if (product.status !== 200)
            return product;
        const idProduct = await this.db.query(`
        SELECT IdProduct FROM Product ORDER BY IdProduct DESC LIMIT 1;
      `);
        console.log(idProduct[0].idproduct);
        const resultDetails = await this.db.query(`
        SELECT create_detailproduct($1, $2, $3, $4) AS message;
      `, [idProduct[0].idproduct, minStock, purchasePrice, salePrice]);
        if (!resultDetails.length)
            throw new common_1.BadRequestException('Error al crear el detalle del producto.');
        const productDetail = ResponseValidations_1.ResponseValidation.forMessage(resultDetails, "correctamente");
        if (productDetail.status !== 200)
            return productDetail;
        return product;
    }
    async createDetail(idProduct, { minStock, purchasePrice, salePrice }) {
        const result = await this.db.query(`
        SELECT create_detailproduct($1, $2, $3, $4) AS message;
      `, [idProduct, minStock, purchasePrice, salePrice]);
        if (!result.length)
            throw new common_1.BadRequestException('Error al crear el detalle del producto.');
        return ResponseValidations_1.ResponseValidation.forMessage(result, "correctamente");
    }
    async findAll() {
        const products = await this.db.query(`
        SELECT
          p.IdProduct,
          p.code_reference,
          p.NameProduct,
          p.Description as ProductDescription,
          p.Stock,
          p.MeasurementUnit,
          sc.IdSubCategory,
          sc.NameSubCategory,
          sc.Description as SubCategoryDescription,
          sc.Active as SubCategoryActive,
          c.IdCategory,
          c.NameCategory,
          c.Description as CategoryDescription,
          c.Active as CategoryActive,
          dp.iddetailproduct,
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
      `);
        if (!products.length)
            throw new common_1.NotFoundException('Error no hay productos en el sistema');
        return products;
    }
    async findOne(id) {
        const product = await this.db.query(`
        SELECT
          p.IdProduct,
          p.code_reference,
          p.NameProduct,
          p.Description as ProductDescription,
          p.Stock,
          p.MeasurementUnit,
          sc.IdSubCategory,
          sc.NameSubCategory,
          sc.Description as SubCategoryDescription,
          sc.Active as SubCategoryActive,
          c.IdCategory,
          c.NameCategory,
          c.Description as CategoryDescription,
          c.Active as CategoryActive,
          dp.iddetailproduct,
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
      `, [id]);
        if (!product.length)
            throw new common_1.BadRequestException(`Error el usuario con el ID ${id} no existe en el sistema.`);
        return product;
    }
    async update(id, { codeReference, nameProduct, description, idSubCategory, stock, measurementUnit, idDetail, minStock, purchasePrice, salePrice }) {
        const result = await this.db.query(`
        SELECT update_product($1,$2,$3,$4,$5,$6,$7) AS message;
      `, [
            id, codeReference, nameProduct, description,
            idSubCategory, stock, measurementUnit
        ]);
        if (!result.length)
            throw new common_1.BadRequestException(`Error al actualizar el producto con el ID ${id}`);
        const updateProduct = ResponseValidations_1.ResponseValidation.forMessage(result, "correctamente");
        if (updateProduct.status !== 200)
            return updateProduct;
        const resultDetail = await this.db.query(`
        SELECT update_detailproduct($1, $2, $3, $4) AS messagel;
      `, [
            idDetail, minStock, purchasePrice, salePrice
        ]);
        if (!resultDetail.length)
            throw new common_1.BadRequestException('Error al actualizar el detalle del producto');
        const updateDetail = ResponseValidations_1.ResponseValidation.forMessage(resultDetail, "correctamente");
        if (updateDetail.status !== 200)
            return updateDetail;
        return updateProduct;
    }
    async remove(id) {
        const result = await this.db.query(`
        SELECT delete_product($1) AS message;
      `, [id]);
        if (!result.length)
            throw new common_1.BadRequestException(`Error al eliminar el producto con el ID: ${id}`);
        const remuve = ResponseValidations_1.ResponseValidation.forMessage(result, "correctamente");
        if (remuve.status !== 200)
            return remuve;
        await this.db.query(`
        UPDATE DetailProduct SET active = false WHERE IdProduct = $1
      `, [id]);
        return remuve;
    }
    async restore(id) {
        const result = await this.db.query(`
        SELECT restore_product($1) AS message;
      `, [id]);
        if (!result.length)
            throw new common_1.BadRequestException(`Error al restaurar el producto con el ID: ${id}`);
        const restore = ResponseValidations_1.ResponseValidation.forMessage(result, "correctamente");
        if (restore.status !== 200)
            return restore;
        await this.db.query(`
        UPDATE DetailProduct
        SET active = true
        WHERE iddetailproduct = (
            SELECT iddetailproduct
            FROM DetailProduct
            WHERE IdProduct = $1
            ORDER BY iddetailproduct DESC
            LIMIT 1
        );
      `, [id]);
        return restore;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], ProductsService);
//# sourceMappingURL=products.service.js.map