import { PartialType } from '@nestjs/swagger';
import { CreateFactusDto } from './create-factus.dto';

export class UpdateFactusDto extends PartialType(CreateFactusDto) {}
