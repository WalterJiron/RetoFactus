import { IntersectionType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { CreateProductDetailsDto } from './create-prodestDetails.dto';

export class CreateProductFullDto extends IntersectionType(
    CreateProductDto,
    CreateProductDetailsDto,
) {
}
