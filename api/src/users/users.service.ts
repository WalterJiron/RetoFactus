import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DataSource } from 'typeorm';
import { ResponseValidation } from '../utils/ResponseValidations';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../auth/enums/role.enum';

@Auth(Role.Admin)
@Injectable()
export class UsersService {
  constructor(private readonly db: DataSource) { }

  async create(estId: number, { nameUser, email, password, role }: CreateUserDto) {
    const result = await this.db.query(
      `
        SELECT create_users($1, $2, $3, $4, $5) AS message
      `,
      [
        nameUser,
        email,
        password,
        role,
        estId,
      ]
    );

    if (!result.length) throw new BadRequestException('Error interno al crear el usuario.');

    return ResponseValidation.forMessage(result, "correctamente");
  }

  async findAll(estId: number) {
    const users = await this.db.query(
      `
        SELECT
          U.iduser as id,
          U.nameuser as name,
          U.email,
          U.roleuser as id_role,
          R.name as role_name,
          U.lastlogin,
          U.Datecreate,
          U.DateUpdate,
          U.active
        FROM users AS U
        LEFT JOIN roles AS R
          ON U.roleuser = R.idrole
        WHERE U.IdEstablishment = $1
        ORDER BY U.iduser DESC;
      `, [estId]
    );

    if (!users.length) throw new NotFoundException('No hay usuarios ingresados en el sistema.');

    return users;
  }

  async findOne(id: number, estId: number) {
    const user = await this.db.query(
      `
        SELECT
          U.iduser as id,
          U.nameuser as name,
          U.email,
          U.roleuser as id_role,
          R.name as role_name,
          U.lastlogin,
          U.Datecreate,
          U.DateUpdate,
          U.active
        FROM users AS U
        LEFT JOIN roles AS R
          ON U.roleuser = R.idrole
        WHERE U.iduser = $1 AND U.IdEstablishment = $2;
      `, [id, estId]
    );

    if (!user.length) throw new BadRequestException(`El usuario con el id ${id} no se encuentra en el sistema.`);

    return user;
  }

  async update(id: number, { nameUser, email, password, role }: UpdateUserDto, estId: number) {
    const result = await this.db.query(
      `
        SELECT update_users($1, $2, $3, $4, $5, $6) AS message;
      `,
      [
        id, nameUser,
        email, password,
        role, estId,
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

    if (!result.length) throw new BadRequestException(`Error al restaurar el usuario con ID: ${id}`);

    return ResponseValidation.forMessage(result, "correctamente");
  }
}
