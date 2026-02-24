import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentFormDto {
    @ApiProperty({
        description: 'Código único de la forma de pago (2-10 caracteres, solo letras, números, guiones y guiones bajos)',
        example: 'EFECTIVO',
        minLength: 2,
        maxLength: 10,
    })
    @Transform(({ value }) => value?.trim())
    @IsString({ message: 'El código debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El código es obligatorio' })
    @Matches(/^[A-Za-z0-9_-]+$/, {
        message: 'El código solo puede contener letras, números, guiones y guiones bajos',
    })
    code!: string;

    @ApiProperty({
        description: 'Nombre de la forma de pago (2-100 caracteres)',
        example: 'Efectivo',
        minLength: 2,
        maxLength: 100,
    })
    @Transform(({ value }) => value?.trim().toLowerCase())
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
    name!: string;
}