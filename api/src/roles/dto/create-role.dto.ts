import { IsString, IsNotEmpty, Length, MinLength, MaxLength, Matches, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
    @ApiProperty({
        description: 'Nombre del rol (2-50 caracteres, único, solo letras y espacios)',
        example: 'Administrador',
        minLength: 2,
        maxLength: 50,
    })
    @IsString({ message: 'El nombre del rol debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El nombre del rol es obligatorio' })
    @Length(2, 50, {
        message: 'El nombre del rol debe tener entre 2 y 50 caracteres'
    })
    @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, {
        message: 'El nombre del rol solo puede contener letras y espacios'
    })
    @Transform(({ value }) => value?.trim())
    name!: string;

    @ApiProperty({
        description: 'Descripción del rol (mínimo 5 caracteres)',
        example: 'Tiene acceso completo a todas las funcionalidades del sistema',
        minLength: 5,
    })
    @IsString({ message: 'La descripción debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'La descripción es obligatoria' })
    @MinLength(5, {
        message: 'La descripción debe tener al menos 5 caracteres'
    })
    @Transform(({ value }) => value?.trim())
    description!: string;
}