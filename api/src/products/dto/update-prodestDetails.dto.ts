import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDetailsDto } from './create-prodestDetails.dto';

export class UpdateProductDetailsDto extends PartialType(CreateProductDetailsDto) {

}