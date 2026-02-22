import { IsString, IsNotEmpty, Length, IsEmail, IsInt, Min, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEstablishmentDto {
    @ApiProperty({
        description: 'Nombre del establecimiento (2-100 caracteres)',
        example: 'Supermercado Central',
        minLength: 2,
        maxLength: 100,
    })
    @Transform(({ value }) => value?.trim())
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El nombre del establecimiento es obligatorio' })
    @Length(2, 100, {
        message: 'El nombre debe tener entre 2 y 100 caracteres'
    })
    name!: string;

    @ApiProperty({
        description: 'Dirección del establecimiento (no vacía)',
        example: 'Av. Principal #123, Centro',
    })
    @Transform(({ value }) => value?.trim())
    @IsString({ message: 'La dirección debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'La dirección del establecimiento es obligatoria' })
    @Matches(/\S/, {
        message: 'La dirección no puede estar vacía o contener solo espacios'
    })
    address!: string;

    @ApiProperty({
        description: 'Teléfono del establecimiento (formato válido: dígitos, espacios, +, -, ())',
        example: '+505 87510265',
    })
    @Transform(({ value }) => value?.trim())
    @IsString({ message: 'El teléfono debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El teléfono del establecimiento es obligatorio' })
    @Matches(/^[0-9\s\-+()]+$/, {
        message: 'Formato de teléfono inválido. Use solo dígitos, espacios, +, -, ()'
    })
    phoneNumber!: string;

    @ApiProperty({
        description: 'Email del establecimiento (formato válido)',
        example: 'contacto@supermercado.com',
    })
    @Transform(({ value }) => value?.trim().toLowerCase())
    @IsEmail({}, { message: 'Formato de email inválido' })
    @IsNotEmpty({ message: 'El email del establecimiento es obligatorio' })
    email!: string;

    @ApiProperty({
        description: 'ID del municipio (entero positivo)',
        example: 5,
        minimum: 1,
    })
    @IsInt({ message: 'El ID del municipio debe ser un número entero' })
    @IsNotEmpty({ message: 'El ID del municipio es obligatorio' })
    @Min(1, { message: 'El ID del municipio debe ser un número positivo' })
    municipalityId!: number;
}