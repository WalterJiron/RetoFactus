import { IsString, IsNotEmpty, Length, MinLength, IsInt, Min, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubCategoryDto {
    @ApiProperty({
        description: 'Nombre de la subcategoría (2-60 caracteres, único dentro de la categoría)',
        example: 'Smartphones',
        minLength: 2,
        maxLength: 60,
    })
    @Transform(({ value }) => value?.trim())
    @IsString({ message: 'El nombre de la subcategoría debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El nombre de la subcategoría es obligatorio' })
    @Length(2, 60, {
        message: 'El nombre de la subcategoría debe tener entre 2 y 60 caracteres'
    })
    @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\-_&]+$/, {
        message: 'El nombre solo puede contener letras, números, espacios y los caracteres especiales: -_&'
    })
    nameSubCategory!: string;

    @ApiProperty({
        description: 'Descripción de la subcategoría (no vacía)',
        example: 'Teléfonos inteligentes y dispositivos móviles',
    })
    @Transform(({ value }) => value?.trim())
    @IsString({ message: 'La descripción debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'La descripción es obligatoria' })
    @MinLength(1, {
        message: 'La descripción no puede estar vacía después de recortar espacios'
    })
    description!: string;

    @ApiProperty({
        description: 'ID de la categoría padre (debe existir y estar activa)',
        example: 1,
        minimum: 1,
    })
    @IsInt({ message: 'El ID de la categoría debe ser un número entero' })
    @IsNotEmpty({ message: 'El ID de la categoría es obligatorio' })
    @Min(1, { message: 'El ID de la categoría debe ser mayor o igual a 1' })
    categorySub!: number;
}