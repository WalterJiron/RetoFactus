import { Transform } from 'class-transformer';
import {
    IsString,
    IsNotEmpty,
    MaxLength,
    IsEmail,
    Min,
    IsInt,
} from 'class-validator';

export class CreateUserDto {
    @Transform(({ value }) => value?.trim())
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    nameUser: string;

    @Transform(({ value }) => value?.trim())
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @Transform(({ value }) => value?.trim())
    @IsString()
    @IsNotEmpty()
    password: string;

    @IsInt()
    @IsNotEmpty()
    @Min(1)
    rol: number;
}
