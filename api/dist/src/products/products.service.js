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
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const auth_decorator_1 = require("../auth/decorators/auth.decorator");
const role_enum_1 = require("../auth/enums/role.enum");
const typeorm_1 = require("typeorm");
const ResponseValidations_1 = require("../utils/ResponseValidations");
let ProductsService = class ProductsService {
    constructor(db) {
        this.db = db;
    }
    async create({ codeReference, nameProduct, description, idSubCategory, stock, measurementUnit, }) {
        const result = await this.db.query(`
        SELECT create_product($1,$2,$3,$4,$5,$6) AS message;
      `, [
            codeReference, nameProduct, description,
            idSubCategory, stock, measurementUnit,
        ]);
        if (!result.length)
            throw new common_1.BadRequestException('Error al crear el producto.');
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
      `, [id]);
        if (!product.length)
            throw new common_1.BadRequestException(`Error el usuario con el ID ${id} no existe en el sistema.`);
        return product;
    }
    async update(id, { codeReference, nameProduct, description, idSubCategory, stock, measurementUnit, }) {
        const result = await this.db.query(`
        SELECT update_product($1,$2,$3,$4,$5,$6,$7) AS message;
      `, [
            id, codeReference, nameProduct, description,
            idSubCategory, stock, measurementUnit
        ]);
        if (!result.length)
            throw new common_1.BadRequestException(`Error al actualizar el producto con el ID ${id}`);
        return ResponseValidations_1.ResponseValidation.forMessage(result, "correctamente");
    }
    async remove(id) {
        const result = await this.db.query(`
        SELECT delete_product($1) AS message;
      `, [id]);
        if (!result.length)
            throw new common_1.BadRequestException(`Error al eliminar el producto con el ID: ${id}`);
        return ResponseValidations_1.ResponseValidation.forMessage(result, "correctamente");
    }
    async restore(id) {
        const result = await this.db.query(`
        SELECT restore_product($1) AS message;
      `, [id]);
        if (!result.length)
            throw new common_1.BadRequestException(`Error al restaurar el producto con el ID: ${id}`);
        return ResponseValidations_1.ResponseValidation.forMessage(result, "correctamente");
    }
};
exports.ProductsService = ProductsService;
__decorate([
    (0, auth_decorator_1.Auth)(role_enum_1.Role.Vendedor),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto]),
    __metadata("design:returntype", Promise)
], ProductsService.prototype, "create", null);
__decorate([
    (0, auth_decorator_1.Auth)(role_enum_1.Role.Vendedor),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsService.prototype, "findAll", null);
__decorate([
    (0, auth_decorator_1.Auth)(role_enum_1.Role.Vendedor),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductsService.prototype, "findOne", null);
__decorate([
    (0, auth_decorator_1.Auth)(role_enum_1.Role.Vendedor),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", Promise)
], ProductsService.prototype, "update", null);
exports.ProductsService = ProductsService = __decorate([
    (0, auth_decorator_1.Auth)(role_enum_1.Role.Admin),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], ProductsService);
//# sourceMappingURL=products.service.js.map