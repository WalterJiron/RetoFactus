import { Transform } from 'class-transformer';
import {
    IsString,
    IsNotEmpty,
    Length,
    IsEmail,
    IsInt,
    Min,
    Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({
        description: 'Nombre del usuario (2-50 caracteres, solo letras, números y espacios)',
        example: 'Juan Pérez',
        minLength: 2,
        maxLength: 50
    })
    @Transform(({ value }) => value?.trim())
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @Length(2, 50, { message: 'El nombre debe tener entre 2 y 50 caracteres' })
    @Matches(/^[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s]+$/, {
        message: 'El nombre solo puede contener letras, números y espacios'
    })
    nameUser!: string;

    @ApiProperty({
        description: 'Email único del usuario (formato válido)',
        example: 'juan.perez@empresa.com'
    })
    @Transform(({ value }) => value?.trim().toLowerCase())
    @IsEmail({}, { message: 'Formato de email inválido' })
    @IsNotEmpty({ message: 'El email es obligatorio' })
    email!: string;

    @ApiProperty({
        description: 'Contraseña que debe cumplir: mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número, un carácter especial (!@#$%^&*) y sin espacios',
        example: 'Contraseña1!',
        minLength: 8
    })
    @IsString({ message: 'La contraseña debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/, {
        message: 'La contraseña debe tener mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número, un carácter especial (!@#$%^&*) y sin espacios'
    })
    password!: string;

    @ApiProperty({
        description: 'ID del rol (debe existir y estar activo)',
        example: 1,
        minimum: 1
    })
    @IsInt({ message: 'El rol debe ser un número entero' })
    @IsNotEmpty({ message: 'El rol es obligatorio' })
    @Min(1, { message: 'El ID del rol debe ser mayor o igual a 1' })
    roleUser!: number;

    @ApiProperty({
        description: 'ID del establecimiento (debe existir y estar activo)',
        example: 3,
        minimum: 1
    })
    @IsInt({ message: 'El establecimiento debe ser un número entero' })
    @IsNotEmpty({ message: 'El establecimiento es obligatorio' })
    @Min(1, { message: 'El ID del establecimiento debe ser mayor o igual a 1' })
    idEstablishment!: number;
}