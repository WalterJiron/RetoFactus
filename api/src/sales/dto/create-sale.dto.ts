import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  Min,
  IsDate,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateSaleDetailDto } from './create-sale_detail.dto';

export class CreateSaleDto {
  @ApiProperty({
    description: 'ID del cliente (debe existir y estar activo)',
    example: 42,
    minimum: 1,
  })
  @IsInt({ message: 'El ID del cliente debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del cliente es obligatorio' })
  @Min(1, { message: 'El ID del cliente debe ser mayor o igual a 1' })
  customerId!: number;

  @ApiProperty({
    description: 'ID de la forma de pago (debe existir y estar activa)',
    example: 5,
    minimum: 1,
  })
  @IsInt({ message: 'El ID de la forma de pago debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID de la forma de pago es obligatorio' })
  @Min(1, { message: 'El ID de la forma de pago debe ser mayor o igual a 1' })
  paymentFormId!: number;

  @ApiPropertyOptional({
    description: 'Fecha de la venta (por defecto la fecha y hora actual)',
    example: '2024-03-20T15:30:00.000Z',
  })
  @IsOptional()
  @IsDate({ message: 'La fecha de venta debe ser una fecha válida' })
  @Type(() => Date)
  saleDate?: Date;

  @ApiProperty({
    description: 'Detalles de la venta (mínimo un ítem)',
    type: [CreateSaleDetailDto],
    example: [
      {
        productId: 15,
        quantity: 2,
        unitPrice: 15000.5,
        discountRate: 10,
        taxRate: 19,
        tributeId: 1,
        isExcluded: false,
        unitMeasureId: 2,
      },
    ],
  })
  @IsArray({ message: 'Los detalles deben ser un arreglo' })
  @ArrayMinSize(1, { message: 'La venta debe tener al menos un detalle' })
  @ValidateNested({ each: true })
  @Type(() => CreateSaleDetailDto)
  details!: CreateSaleDetailDto[];
}