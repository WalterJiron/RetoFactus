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
exports.CreateUserDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateUserDto {
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nombre del usuario (2-50 caracteres, solo letras y espacios)',
        example: 'Juan Pérez',
        minLength: 2,
        maxLength: 50
    }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    (0, class_validator_1.IsString)({ message: 'El nombre debe ser una cadena de texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre es obligatorio' }),
    (0, class_validator_1.Length)(2, 50, { message: 'El nombre debe tener entre 2 y 50 caracteres' }),
    (0, class_validator_1.Matches)(/^[a-zA-ZáéíóúüÑñ0-9\s]+$/, {
        message: 'El nombre solo puede contener letras, números y espacios'
    }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "nameUser", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email único del usuario (formato válido)',
        example: 'juan.perez@empresa.com'
    }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim().toLowerCase()),
    (0, class_validator_1.IsEmail)({}, { message: 'Formato de email inválido' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El email es obligatorio' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Contraseña que debe cumplir: mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número, un carácter especial (!@#$%^&*) y sin espacios',
        example: 'Contraseña1!',
        minLength: 8
    }),
    (0, class_validator_1.IsString)({ message: 'La contraseña debe ser una cadena de texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'La contraseña es obligatoria' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/, {
        message: 'La contraseña debe tener mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número, un carácter especial (!@#$%^&*) y sin espacios'
    }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID del rol (debe existir y estar activo)',
        example: 1,
        minimum: 1
    }),
    (0, class_validator_1.IsInt)({ message: 'El rol debe ser un número entero' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El rol es obligatorio' }),
    (0, class_validator_1.Min)(1, { message: 'El ID del rol debe ser mayor o igual a 1' }),
    __metadata("design:type", Number)
], CreateUserDto.prototype, "role", void 0);
//# sourceMappingURL=create-user.dto.js.map