import {
    IsInt,
    IsNotEmpty,
    Min,
    IsOptional,
    IsNumber,
    IsPositive,
    Max,
    IsBoolean
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSaleDetailDto {
    @ApiProperty({
        description: 'ID del producto (debe existir y estar activo)',
        example: 15,
        minimum: 1,
    })
    @IsInt({ message: 'El ID del producto debe ser un número entero' })
    @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
    @Min(1, { message: 'El ID del producto debe ser mayor o igual a 1' })
    productId!: number;

    @ApiProperty({
        description: 'Cantidad del producto (positiva)',
        example: 2.5,
        minimum: 0.01,
    })
    @IsNumber({ maxDecimalPlaces: 3 }, { message: 'La cantidad debe ser un número con hasta 3 decimales' })
    @IsNotEmpty({ message: 'La cantidad es obligatoria' })
    @IsPositive({ message: 'La cantidad debe ser positiva' })
    quantity!: number;

    @ApiProperty({
        description: 'Precio unitario del producto (positivo)',
        example: 15000.50,
        minimum: 0.01,
    })
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio unitario debe ser un número con hasta 2 decimales' })
    @IsNotEmpty({ message: 'El precio unitario es obligatorio' })
    @IsPositive({ message: 'El precio unitario debe ser positivo' })
    unitPrice!: number;

    @ApiPropertyOptional({
        description: 'Tasa de descuento (0-100)',
        example: 10,
        default: 0,
        minimum: 0,
        maximum: 100,
    })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'La tasa de descuento debe ser un número con hasta 2 decimales' })
    @Min(0, { message: 'La tasa de descuento no puede ser negativa' })
    @Max(100, { message: 'La tasa de descuento no puede ser mayor a 100' })
    discountRate?: number = 0;

    @ApiProperty({
        description: 'Tasa de impuesto aplicada al producto (positiva)',
        example: 19.0,
        minimum: 0,
    })
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'La tasa de impuesto debe ser un número con hasta 2 decimales' })
    @IsNotEmpty({ message: 'La tasa de impuesto es obligatoria' })
    @Min(0, { message: 'La tasa de impuesto no puede ser negativa' })
    taxRate!: number;

    @ApiPropertyOptional({
        description: 'ID del tributo (opcional)',
        example: 1,
    })
    @IsOptional()
    @IsInt({ message: 'El ID del tributo debe ser un número entero' })
    @Min(1, { message: 'El ID del tributo debe ser mayor o igual a 1' })
    tributeId?: number;

    @ApiPropertyOptional({
        description: 'Indica si el producto está excluido de impuestos',
        example: false,
        default: false,
    })
    @IsOptional()
    @IsBoolean({ message: 'isExcluded debe ser un valor booleano' })
    isExcluded?: boolean = false;

    @ApiProperty({
        description: 'ID de la unidad de medida (debe ser positivo)',
        example: 2,
        minimum: 1,
    })
    @IsInt({ message: 'El ID de la unidad de medida debe ser un número entero' })
    @IsNotEmpty({ message: 'El ID de la unidad de medida es obligatorio' })
    @Min(1, { message: 'El ID de la unidad de medida debe ser mayor o igual a 1' })
    unitMeasureId!: number;
}