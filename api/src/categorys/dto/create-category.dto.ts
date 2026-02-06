
import { IsString, IsNotEmpty, Length, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiProperty({
        description: 'Nombre de la categoría (2-60 caracteres, único)',
        example: 'Electrónica',
        minLength: 2,
        maxLength: 60,
    })
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El nombre de la categoría es obligatorio' })
    @Length(2, 60, { message: 'El nombre debe tener entre 2 y 60 caracteres' })
    @Transform(({ value }) => value?.trim())
    nameCategory!: string;

    @ApiProperty({
        description: 'Descripción de la categoría (no vacía)',
        example: 'Dispositivos electrónicos y gadgets',
    })
    @IsString({ message: 'La descripción debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'La descripción es obligatoria' })
    @Transform(({ value }) => value?.trim())
    @MinLength(1, { message: 'La descripción no puede estar vacía después de recortar espacios' })
    description!: string;
}