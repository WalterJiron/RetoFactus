import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { DataSource } from 'typeorm';
import { ResponseValidation } from '../utils/ResponseValidations';
import { retry } from 'rxjs';

@Injectable()
export class RolesService {

  constructor(private readonly db: DataSource) { }

  async create({ name, description }: CreateRoleDto) {
    const result = await this.db.query(
      `
        SELECT ProcInsertRol($1, $2) AS message;
      `,
      [
        name,
        description,
      ]
    );

    if (!result.length) throw new InternalServerErrorException("Error interno al ingresar un rol");

    return ResponseValidation.forMessage(result, "registrado correctamente");
  }

  async findAll() {
    const roles = await this.db.query(
      `
        SELECT
          idrole as id,
            namer as name_rol,
            description,
            TO_CHAR(
                datecreate AT TIME ZONE 'America/Managua',
                'DD/MM/YYYY HH12:MI AM'
            ) as datecreate_local,
            active
        FROM roles
        ORDER BY idrole DESC;
      `
    );

    if (!roles.length) throw new NotFoundException('No hay roles registrados');

    return roles;
  }

  async findOne(id: number) {
    const role = await this.db.query(
      `
        SELECT
          idrole as id,
            namer as name_rol,
            description,
            TO_CHAR(
                datecreate AT TIME ZONE 'America/Managua',
                'DD/MM/YYYY HH12:MI AM'
            ) as datecreate_local,
            active
        FROM roles
        WHERE idrole = $1;
      `, [id]
    );

    if (!role.length) throw new BadRequestException(`El rol con id ${id} no existe`);

    return role[0];
  }

  async update(id: number, { name, description }: UpdateRoleDto) {
    const result = await this.db.query(
      `
        SELECT ProcUpdateRol_serial($1,$2,$3) as message;
      `,
      [
        id,
        name,
        description,
      ]
    );

    if (!result.length) throw new BadRequestException(`El rol con el id ${id} no se encuentar en el sistema.`);

    return ResponseValidation.forMessage(result, "actualizado correctamente");
  }

  async remove(id: number) {
    const result = await this.db.query(
      `
        SELECT ProcDeleteRol($1) AS message;
      `, [id]
    );

    if (!result.length) throw new BadRequestException(`El rol con el id ${id} no se encuentar en el sistema.`);

    return ResponseValidation.forMessage(result, "desactivado correctamente");
  }

  async restore(id: number) {
    const result = await this.db.query(
      `
          SELECT ProcRecoverRol($1) AS message;
        `, [id]
    );

    if (!result.length) throw new BadRequestException(`El rol con el id ${id} no se encuentra en el sistema.`);

    return ResponseValidation.forMessage(result, "recuperado correctamente");
  }
}
