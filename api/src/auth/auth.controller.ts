import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';
import { Throttle } from '@nestjs/throttler';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Throttle({
  default: {
    limit: parseInt(process.env.LIMIT_REQUESTS_LOGIN!) || 5,
    ttl: parseInt(process.env.TTL_REQUESTS_LOGIN!) || 60000,
    blockDuration: parseInt(process.env.BLOCK_DURATION_LOGIN!) || 300000,
  }
})
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @ApiOperation({
    summary: 'Inicio de sesión',
    description: 'Autentica a un usuario y devuelve un token JWT junto con información del perfil.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Autenticación exitosa. Devuelve el token de acceso.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Credenciales inválidas o cuenta bloqueada por demasiados intentos.',
  })
  signIn(@Body() signIn: SignInDto) {
    return this.authService.signIn(signIn);
  }
}

