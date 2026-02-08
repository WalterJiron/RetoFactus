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
exports.CreateProductDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateProductDto {
}
exports.CreateProductDto = CreateProductDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Código de referencia único (opcional, único si se proporciona)',
        example: 'PROD-001',
        maxLength: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value ? value.trim() : null)),
    (0, class_validator_1.IsString)({ message: 'El código de referencia debe ser una cadena de texto' }),
    (0, class_validator_1.Length)(1, 100, { message: 'El código de referencia debe tener entre 1 y 100 caracteres' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "codeReference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nombre del producto (2-80 caracteres)',
        example: 'Laptop Gamer Pro',
        minLength: 2,
        maxLength: 80,
    }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    (0, class_validator_1.IsString)({ message: 'El nombre del producto debe ser una cadena de texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre del producto es obligatorio' }),
    (0, class_validator_1.Length)(2, 80, { message: 'El nombre debe tener entre 2 y 80 caracteres' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "nameProduct", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Descripción del producto (no vacía)',
        example: 'Laptop de alto rendimiento para gaming y trabajo profesional',
    }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    (0, class_validator_1.IsString)({ message: 'La descripción debe ser una cadena de texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'La descripción es obligatoria' }),
    (0, class_validator_1.MinLength)(1, { message: 'La descripción no puede estar vacía después de recortar espacios' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID de la subcategoría (debe existir y estar activa)',
        example: 5,
        minimum: 1,
    }),
    (0, class_validator_1.IsInt)({ message: 'El ID de la subcategoría debe ser un número entero' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El ID de la subcategoría es obligatorio' }),
    (0, class_validator_1.Min)(1, { message: 'El ID de la subcategoría debe ser mayor o igual a 1' }),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "idSubCategory", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Stock inicial (>= 0)',
        example: 50,
        minimum: 0,
    }),
    (0, class_validator_1.IsInt)({ message: 'El stock debe ser un número entero' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El stock es obligatorio' }),
    (0, class_validator_1.Min)(0, { message: 'El stock no puede ser negativo' }),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "stock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unidad de medida (entero positivo, representa tipo de unidad)',
        example: 1,
        minimum: 1,
    }),
    (0, class_validator_1.IsInt)({ message: 'La unidad de medida debe ser un número entero' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'La unidad de medida es obligatoria' }),
    (0, class_validator_1.IsPositive)({ message: 'La unidad de medida debe ser un valor positivo' }),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "measurementUnit", void 0);
//# sourceMappingURL=create-product.dto.js.map