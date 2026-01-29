import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class RolesService {

  constructor(private readonly db: DataSource) { }

  create(createRoleDto: CreateRoleDto) {
    return 'This action adds a new role';
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

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
