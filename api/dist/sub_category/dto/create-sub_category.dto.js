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
exports.CreateSubCategoryDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateSubCategoryDto {
}
exports.CreateSubCategoryDto = CreateSubCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nombre de la subcategoría (2-60 caracteres, único dentro de la categoría)',
        example: 'Smartphones',
        minLength: 2,
        maxLength: 60,
    }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    (0, class_validator_1.IsString)({ message: 'El nombre de la subcategoría debe ser una cadena de texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre de la subcategoría es obligatorio' }),
    (0, class_validator_1.Length)(2, 60, {
        message: 'El nombre de la subcategoría debe tener entre 2 y 60 caracteres'
    }),
    (0, class_validator_1.Matches)(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\-_&]+$/, {
        message: 'El nombre solo puede contener letras, números, espacios y los caracteres especiales: -_&'
    }),
    __metadata("design:type", String)
], CreateSubCategoryDto.prototype, "nameSubCategory", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Descripción de la subcategoría (no vacía)',
        example: 'Teléfonos inteligentes y dispositivos móviles',
    }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    (0, class_validator_1.IsString)({ message: 'La descripción debe ser una cadena de texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'La descripción es obligatoria' }),
    (0, class_validator_1.MinLength)(1, {
        message: 'La descripción no puede estar vacía después de recortar espacios'
    }),
    __metadata("design:type", String)
], CreateSubCategoryDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID de la categoría padre (debe existir y estar activa)',
        example: 1,
        minimum: 1,
    }),
    (0, class_validator_1.IsInt)({ message: 'El ID de la categoría debe ser un número entero' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El ID de la categoría es obligatorio' }),
    (0, class_validator_1.Min)(1, { message: 'El ID de la categoría debe ser mayor o igual a 1' }),
    __metadata("design:type", Number)
], CreateSubCategoryDto.prototype, "categorySub", void 0);
//# sourceMappingURL=create-sub_category.dto.js.map