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
exports.CreateRoleDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateRoleDto {
}
exports.CreateRoleDto = CreateRoleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nombre del rol (2-50 caracteres, único, solo letras y espacios)',
        example: 'Administrador',
        minLength: 2,
        maxLength: 50,
    }),
    (0, class_validator_1.IsString)({ message: 'El nombre del rol debe ser una cadena de texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre del rol es obligatorio' }),
    (0, class_validator_1.Length)(2, 50, {
        message: 'El nombre del rol debe tener entre 2 y 50 caracteres'
    }),
    (0, class_validator_1.Matches)(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, {
        message: 'El nombre del rol solo puede contener letras y espacios'
    }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateRoleDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Descripción del rol (mínimo 5 caracteres)',
        example: 'Tiene acceso completo a todas las funcionalidades del sistema',
        minLength: 5,
    }),
    (0, class_validator_1.IsString)({ message: 'La descripción debe ser una cadena de texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'La descripción es obligatoria' }),
    (0, class_validator_1.MinLength)(5, {
        message: 'La descripción debe tener al menos 5 caracteres'
    }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateRoleDto.prototype, "description", void 0);
//# sourceMappingURL=create-role.dto.js.map