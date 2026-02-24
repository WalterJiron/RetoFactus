import { IsString, IsNotEmpty, Length, IsEmail, IsInt, Min, IsOptional, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
    @ApiProperty({
        description: 'Identificación única del cliente (mínimo 3 caracteres)',
        example: '123456789',
        minLength: 3,
    })
    @Transform(({ value }) => value?.trim())
    @IsString({ message: 'La identificación debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'La identificación es obligatoria' })
    @Length(3, 50, { message: 'La identificación debe tener al menos 3 caracteres' })
    identification!: string;

    @ApiProperty({
        description: 'Nombres completos del cliente (mínimo 2 caracteres)',
        example: 'Juan Carlos Pérez Gómez',
        minLength: 2,
    })
    @Transform(({ value }) => value?.trim())
    @IsString({ message: 'Los nombres deben ser una cadena de texto' })
    @IsNotEmpty({ message: 'Los nombres son obligatorios' })
    @Length(2, 100, { message: 'Los nombres deben tener al menos 2 caracteres' })
    names!: string;

    @ApiProperty({
        description: 'Dirección del cliente (no vacía)',
        example: 'Calle 123 #45-67, Barrio Centro',
    })
    @Transform(({ value }) => value?.trim().toLowerCase())
    @IsString({ message: 'La dirección debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'La dirección es obligatoria' })
    @Matches(/\S/, { message: 'La dirección no puede estar vacía o contener solo espacios' })
    address!: string;

    @ApiProperty({
        description: 'Correo electrónico del cliente (único y válido)',
        example: 'cliente@ejemplo.com',
    })
    @Transform(({ value }) => value?.trim().toLowerCase())
    @IsEmail({}, { message: 'Formato de email inválido' })
    @IsNotEmpty({ message: 'El email es obligatorio' })
    email!: string;

    @ApiProperty({
        description: 'Teléfono del cliente (único, formato válido: dígitos, espacios, +, -, ())',
        example: '+505 8763-5417',
    })
    @Transform(({ value }) => value?.trim())
    @IsString({ message: 'El teléfono debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El teléfono es obligatorio' })
    @Matches(/^[0-9\s\-+()]+$/, {
        message: 'Formato de teléfono inválido. Use solo dígitos, espacios, +, -, ()',
    })
    phone!: string;

    @ApiPropertyOptional({
        description: 'ID del régimen tributario (por defecto 21)',
        example: 21,
        default: 21,
    })
    @IsOptional()
    @IsInt({ message: 'El ID del régimen tributario debe ser un número entero' })
    @Min(1, { message: 'El ID del régimen tributario debe ser positivo' })
    tributeId?: number;

    @ApiPropertyOptional({
        description: 'ID del tipo de documento de identificación (por defecto 3)',
        example: 3,
        default: 3,
    })
    @IsOptional()
    @IsInt({ message: 'El ID del tipo de documento debe ser un número entero' })
    @Min(1, { message: 'El ID del tipo de documento debe ser positivo' })
    identificationDocumentId?: number;

    @ApiPropertyOptional({
        description: 'ID del municipio (opcional)',
        example: 5,
    })
    @IsOptional()
    @IsInt({ message: 'El ID del municipio debe ser un número entero' })
    @Min(1, { message: 'El ID del municipio debe ser positivo' })
    municipalityId?: number;
}