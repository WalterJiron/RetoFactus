import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { SignInDto } from './dto/signIn.dto';
import { DataSource } from 'typeorm';
import { ResponseValidation } from '../utils/ResponseValidations';
import { JwtService } from '@nestjs/jwt';
// import { jwtConstants } from './constants/constants';

@Injectable()
export class AuthService {

  constructor(
    private readonly db: DataSource,
    private readonly jwtService: JwtService,
  ) { }

  async signIn({ email, password }: SignInDto) {
    const searchUser = await this.db.query(
      `
        SELECT verify_user($1, $2) AS message;
      `, [email, password]
    );

    if (!searchUser.length) throw new NotFoundException('Error al buscar ususario.');

    const response = ResponseValidation.forMessage(searchUser, "Ok");

    if (response.status !== 200) throw new UnauthorizedException(response.message);

    return this.createTocken(email);
  }

  private async createTocken(email: string) {
    const user = await this.db.query(
      `
        SELECT
          U.iduser as id,
          R.namer as role_name
        FROM users AS U
        LEFT JOIN roles AS R
          ON U.roleuser = R.idrole
        WHERE U.email = $1;
      `, [email]
    );

    if (!user[0].role_name.length) throw new BadRequestException('Error al buscar usuario.');

    const payload = { email: email, role: user[0]?.role_name, };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken: accessToken,
    };
  }
}


