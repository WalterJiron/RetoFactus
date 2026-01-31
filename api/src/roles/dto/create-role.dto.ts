import { Transform } from 'class-transformer';
import {
    IsString,
    IsNotEmpty,
    MaxLength,
} from 'class-validator';

export class CreateRoleDto {
    @Transform(({ value }) => value.trim())
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    name: string;

    @Transform(({ value }) => value.trim())
    @IsString()
    @IsNotEmpty()
    description: string;
}