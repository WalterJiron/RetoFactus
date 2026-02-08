import { IsString, IsNotEmpty, Length, MinLength, IsInt, Min, IsOptional, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
    @ApiPropertyOptional({
        description: 'Código de referencia único (opcional, único si se proporciona)',
        example: 'PROD-001',
        maxLength: 100,
    })
    @IsOptional()
    @Transform(({ value }) => (value ? value.trim() : null))
    @IsString({ message: 'El código de referencia debe ser una cadena de texto' })
    @Length(1, 100, { message: 'El código de referencia debe tener entre 1 y 100 caracteres' })
    codeReference?: string;

    @ApiProperty({
        description: 'Nombre del producto (2-80 caracteres)',
        example: 'Laptop Gamer Pro',
        minLength: 2,
        maxLength: 80,
    })
    @Transform(({ value }) => value?.trim())
    @IsString({ message: 'El nombre del producto debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
    @Length(2, 80, { message: 'El nombre debe tener entre 2 y 80 caracteres' })
    nameProduct!: string;

    @ApiProperty({
        description: 'Descripción del producto (no vacía)',
        example: 'Laptop de alto rendimiento para gaming y trabajo profesional',
    })
    @Transform(({ value }) => value?.trim())
    @IsString({ message: 'La descripción debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'La descripción es obligatoria' })
    @MinLength(1, { message: 'La descripción no puede estar vacía después de recortar espacios' })
    description!: string;

    @ApiProperty({
        description: 'ID de la subcategoría (debe existir y estar activa)',
        example: 5,
        minimum: 1,
    })
    @IsInt({ message: 'El ID de la subcategoría debe ser un número entero' })
    @IsNotEmpty({ message: 'El ID de la subcategoría es obligatorio' })
    @Min(1, { message: 'El ID de la subcategoría debe ser mayor o igual a 1' })
    idSubCategory!: number;

    @ApiProperty({
        description: 'Stock inicial (>= 0)',
        example: 50,
        minimum: 0,
    })
    @IsInt({ message: 'El stock debe ser un número entero' })
    @IsNotEmpty({ message: 'El stock es obligatorio' })
    @Min(0, { message: 'El stock no puede ser negativo' })
    stock!: number;

    @ApiProperty({
        description: 'Unidad de medida (entero positivo, representa tipo de unidad)',
        example: 1,
        minimum: 1,
    })
    @IsInt({ message: 'La unidad de medida debe ser un número entero' })
    @IsNotEmpty({ message: 'La unidad de medida es obligatoria' })
    @IsPositive({ message: 'La unidad de medida debe ser un valor positivo' })
    measurementUnit!: number;
}