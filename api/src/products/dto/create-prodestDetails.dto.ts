import { IsInt, IsNotEmpty, Min, IsNumber, IsPositive, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// Validador personalizado para asegurar que salePrice >= purchasePrice
@ValidatorConstraint({ name: 'IsSalePriceGreaterOrEqual', async: false })
export class IsSalePriceGreaterOrEqualConstraint implements ValidatorConstraintInterface {
    validate(salePrice: number, args: ValidationArguments) {
        const object = args.object as CreateProductDetailsDto;
        return salePrice >= object.purchasePrice;
    }

    defaultMessage(_args: ValidationArguments) {
        return 'El precio de venta no puede ser menor al precio de compra';
    }
}

export class CreateProductDetailsDto {
    @ApiProperty({
        description: 'Stock mínimo (>= 0)',
        example: 10,
        minimum: 0,
    })
    @IsInt({ message: 'El stock mínimo debe ser un número entero' })
    @IsNotEmpty({ message: 'El stock mínimo es obligatorio' })
    @Min(0, { message: 'El stock mínimo no puede ser negativo' })
    minStock!: number;

    @ApiProperty({
        description: 'Precio de compra (>= 0.001)',
        example: 25.50,
        minimum: 0.001,
    })
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({ maxDecimalPlaces: 3 }, {
        message: 'El precio de compra debe ser un número con hasta 3 decimales'
    })
    @IsNotEmpty({ message: 'El precio de compra es obligatorio' })
    @IsPositive({ message: 'El precio de compra debe ser mayor a 0' })
    purchasePrice!: number;

    @ApiProperty({
        description: 'Precio de venta (>= purchasePrice)',
        example: 39.99,
        minimum: 0.001,
    })
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({ maxDecimalPlaces: 3 }, {
        message: 'El precio de venta debe ser un número con hasta 3 decimales'
    })
    @IsNotEmpty({ message: 'El precio de venta es obligatorio' })
    @IsPositive({ message: 'El precio de venta debe ser mayor a 0' })
    @Validate(IsSalePriceGreaterOrEqualConstraint)
    salePrice!: number;
}