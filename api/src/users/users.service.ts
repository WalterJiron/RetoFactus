import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DataSource } from 'typeorm';
import { ResponseValidation } from '../utils/ResponseValidations';
import { time } from 'console';

@Injectable()
export class UsersService {
  constructor(private readonly db: DataSource) { }

  async create({ nameUser, email, password, rol }: CreateUserDto) {
    const result = await this.db.query(
      `
        SELECT create_users($1, $2, $3, $4) AS message
      `,
      [
        nameUser,
        email,
        password,
        rol,
      ]
    );

    if (!result.length) throw new BadRequestException('Error interno al crear el usuario.');

    return ResponseValidation.forMessage(result, "correctamente");
  }

  async findAll() {
    const users = await this.db.query(
      `
        SELECT
          U.iduser as id,
          U.nameuser as name,
          U.email,
          U.roleuser as id_role,
          R.namer as role_name,
          U.lastlogin,
          U.Datecreate,
          U.DateUpdate,
          U.active
        FROM users AS U
        LEFT JOIN roles AS R
          ON U.roleuser = R.idrole
        ORDER BY U.iduser DESC;
      `
    );

    if (!users.length) throw new NotFoundException('No hay usuarios ingresados en el sistema.');

    return users;
  }

  async findOne(id: number) {
    const user = await this.db.query(
      `
        SELECT
          U.iduser as id,
          U.nameuser as name,
          U.email,
          U.roleuser as id_role,
          R.namer as role_name,
          U.lastlogin,
          U.Datecreate,
          U.DateUpdate,
          U.active
        FROM users AS U
        LEFT JOIN roles AS R
          ON U.roleuser = R.idrole
        WHERE U.iduser = $1
        ORDER BY U.iduser DESC;
      `, [id]
    );

    if (!user.length) throw new BadRequestException(`El usuario con el id ${id} no se encuentra en el sistema.`);

    return user;
  }

  async update(id: number, { nameUser, email, password, rol }: UpdateUserDto) {
    const result = await this.db.query(
      `
        SELECT update_users($1, $2, $3, $4, $5) AS message;
      `,
      [
        id, nameUser,
        email, password, rol,
      ]
    );

    if (!result.length) throw new BadRequestException('Error al actualizar el usuario.');

    return ResponseValidation.forMessage(result, "correctamente");
  }

  async remove(id: number) {
    const result = await this.db.query(
      `
        SELECT delete_users($1) AS message
      `, [id]
    );

    if (!result.length) throw new BadRequestException(`Error al eliminar el usuario con el id: ${id}`);

    return ResponseValidation.forMessage(result, "correctamente");
  }

  async restore(id: number) {
    const result = await this.db.query(
      `
        SELECT restore_users($1) AS message;
      `, [id]
    );

    if (!result.length) throw new BadRequestException(`Error al ingresar el usuario con el ID: ${id}`);

    return ResponseValidation.forMessage(result, "correctamente");
  }
}
