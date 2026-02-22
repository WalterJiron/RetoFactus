import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../auth/enums/role.enum';
import { CurrentEstablishment } from '../auth/decorators/get-establishment.decorator';

@Auth(Role.Admin)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @Post()
  async create(@CurrentEstablishment() estId: number, @Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(estId, createRoleDto);
  }

  @Get()
  async findAll(@CurrentEstablishment() estId: number) {
    return this.rolesService.findAll(estId);
  }

  @Get(':id')
  async findOne(@CurrentEstablishment() estId: number, @Param('id') id: string) {
    return this.rolesService.findOne(+id, estId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.rolesService.remove(+id);
  }

  @Put('/activate/:id')
  async restore(@Param('id') id: number) {
    return await this.rolesService.restore(id);
  }
}
