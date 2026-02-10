import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProductFullDto } from './create-product-full.dto';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class UpdateProductFullDto extends PartialType(CreateProductFullDto) {
    @ApiProperty({
        description: 'ID del detalle (debe existir y estar activo)',
        example: 15,
        minimum: 1,
    })
    @IsInt({ message: 'El ID del detalle debe ser un número entero' })
    @IsNotEmpty({ message: 'El ID del detalle es obligatorio' })
    @Min(1, { message: 'El ID del detalle debe ser mayor o igual a 1' })
    idDetail!: number;
}