import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';
import { Throttle } from '@nestjs/throttler';

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
  signIn(@Body() signIn: SignInDto) {
    return this.authService.signIn(signIn);
  }
}
