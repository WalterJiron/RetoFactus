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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const auth_decorator_1 = require("../auth/decorators/auth.decorator");
const role_enum_1 = require("../auth/enums/role.enum");
const create_product_full_dto_1 = require("./dto/create-product-full.dto");
const update_product_full_dto_1 = require("./dto/update-product-full.dto");
const create_prodestDetails_dto_1 = require("./dto/create-prodestDetails.dto");
const swagger_1 = require("@nestjs/swagger");
let ProductsController = class ProductsController {
    constructor(productsService) {
        this.productsService = productsService;
    }
    async create(createProductDto) {
        return await this.productsService.create(createProductDto);
    }
    async createDetail(idProduct, detail) {
        return await this.productsService.createDetail(idProduct, detail);
    }
    async findAll() {
        return await this.productsService.findAll();
    }
    async findOne(id) {
        return await this.productsService.findOne(+id);
    }
    async update(id, updateProductDto) {
        return await this.productsService.update(+id, updateProductDto);
    }
    async remove(id) {
        return await this.productsService.remove(+id);
    }
    async restore(id) {
        return await this.productsService.restore(id);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, auth_decorator_1.Auth)(role_enum_1.Role.Admin, role_enum_1.Role.Vendedor),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear un nuevo producto completo con sus detalles' }),
    (0, swagger_1.ApiBody)({
        type: create_product_full_dto_1.CreateProductFullDto,
        description: 'Datos del producto y sus detalles',
        examples: {
            ejemplo1: {
                summary: 'Ejemplo de creación de producto',
                value: {
                    codeReference: 'PROD-001',
                    nameProduct: 'Laptop Gamer Pro',
                    description: 'Laptop de alto rendimiento para gaming y trabajo profesional',
                    idSubCategory: 5,
                    stock: 50,
                    measurementUnit: 1,
                    minStock: 10,
                    purchasePrice: 25.50,
                    salePrice: 39.99
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Producto creado exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Error en los datos proporcionados' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_full_dto_1.CreateProductFullDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "create", null);
__decorate([
    (0, auth_decorator_1.Auth)(role_enum_1.Role.Admin, role_enum_1.Role.Vendedor),
    (0, common_1.Post)('details/:idProduct'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear detalles para un producto existente' }),
    (0, swagger_1.ApiBody)({
        type: create_prodestDetails_dto_1.CreateProductDetailsDto,
        description: 'Detalles del producto (stock mínimo, precios)',
        examples: {
            ejemplo1: {
                summary: 'Ejemplo de creación de detalles',
                value: {
                    idProduct: 15,
                    minStock: 10,
                    purchasePrice: 25.50,
                    salePrice: 39.99
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Detalles creados exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Error en los datos proporcionados' }),
    __param(0, (0, common_1.Param)('idProduct')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_prodestDetails_dto_1.CreateProductDetailsDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "createDetail", null);
__decorate([
    (0, auth_decorator_1.Auth)(role_enum_1.Role.Admin, role_enum_1.Role.Vendedor),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, auth_decorator_1.Auth)(role_enum_1.Role.Admin, role_enum_1.Role.Vendedor),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findOne", null);
__decorate([
    (0, auth_decorator_1.Auth)(role_enum_1.Role.Admin, role_enum_1.Role.Vendedor),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_product_full_dto_1.UpdateProductFullDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "remove", null);
__decorate([
    (0, common_1.Put)('activate/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "restore", null);
exports.ProductsController = ProductsController = __decorate([
    (0, auth_decorator_1.Auth)(role_enum_1.Role.Admin),
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map