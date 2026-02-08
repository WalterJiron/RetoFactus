import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
    @ApiProperty({
        description: 'Email del usuario registrado (formato válido)',
        example: 'usuario@empresa.com',
    })
    @Transform(({ value }) => value?.trim().toLowerCase())
    @IsEmail({}, { message: 'Formato de email inválido' })
    @IsNotEmpty({ message: 'El email es obligatorio' })
    email!: string;

    @ApiProperty({
        description: 'Contraseña del usuario (texto plano)',
        example: 'MiContraseñaSegura123!',
        minLength: 1,
    })
    @IsString({ message: 'La contraseña debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    @MinLength(1, { message: 'La contraseña no puede estar vacía' })
    password!: string;
}