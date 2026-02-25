import { PartialType } from '@nestjs/swagger';
import { CreateProductDetailsDto } from './create-prodestDetails.dto';

export class UpdateProductDetailsDto extends PartialType(CreateProductDetailsDto) {

}