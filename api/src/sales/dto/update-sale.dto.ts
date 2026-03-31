import { Type } from 'class-transformer';
import {
  IsInt,
  IsDate,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateSaleDetailDto } from './create-sale_detail.dto';

export class UpdateSaleDto {
  @ApiPropertyOptional({
    description: 'Nuevo ID del cliente (debe existir y estar activo)',
    example: 42,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'El ID del cliente debe ser un número entero' })
  @Min(1, { message: 'El ID del cliente debe ser mayor o igual a 1' })
  customerId?: number;

  @ApiPropertyOptional({
    description: 'Nuevo ID de la forma de pago (debe existir y estar activa)',
    example: 5,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'El ID de la forma de pago debe ser un número entero' })
  @Min(1, { message: 'El ID de la forma de pago debe ser mayor o igual a 1' })
  paymentFormId?: number;

  @ApiPropertyOptional({
    description: 'Nueva fecha de la venta',
    example: '2024-03-20T15:30:00.000Z',
  })
  @IsOptional()
  @IsDate({ message: 'La fecha de venta debe ser una fecha válida' })
  @Type(() => Date)
  saleDate?: Date;

  @ApiPropertyOptional({
    description:
      'Nuevos detalles de la venta. Si se envía, reemplaza TODOS los detalles anteriores ' +
      'y ajusta el stock de inventario. Debe contener al menos un elemento.',
    type: [CreateSaleDetailDto],
    example: [
      {
        productId: 15,
        quantity: 3,
        unitPrice: 15000.5,
        discountRate: 5,
        taxRate: 19,
        tributeId: 1,
        isExcluded: false,
        unitMeasureId: 2,
      },
    ],
  })
  @IsOptional()
  @IsArray({ message: 'Los detalles deben ser un arreglo' })
  @ValidateNested({ each: true })
  @Type(() => CreateSaleDetailDto)
  details?: CreateSaleDetailDto[];
}
