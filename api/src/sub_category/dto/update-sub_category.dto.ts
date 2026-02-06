import { PartialType } from '@nestjs/swagger';
import { CreateSubCategoryDto } from './create-sub_category.dto';

export class UpdateSubCategoryDto extends PartialType(CreateSubCategoryDto) {}
