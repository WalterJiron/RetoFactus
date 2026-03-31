import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SaleStatus {
  Pending = 'pending',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export class UpdateSaleStatusDto {
  @ApiProperty({
    description: 'Nuevo estado de la venta',
    enum: SaleStatus,
    example: SaleStatus.Completed,
  })
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  @IsEnum(SaleStatus, {
    message: 'El estado debe ser uno de: pending, completed, cancelled',
  })
  status!: SaleStatus;
}
