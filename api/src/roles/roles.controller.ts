import { Controller, Get, Post, Body, Patch, Param, Delete, Put, HttpStatus } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../auth/enums/role.enum';
import { CurrentEstablishment } from '../auth/decorators/get-establishment.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Roles')
@ApiBearerAuth('JWT-auth')
@Auth(Role.Admin)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @Post()
  @ApiOperation({ summary: 'Crear rol', description: 'Crea un nuevo rol en el establecimiento.' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Rol creado exitosamente.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos inválidos o nombre de rol duplicado.' })
  async create(@CurrentEstablishment() estId: number, @Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(estId, createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar roles', description: 'Obtiene todos los roles del establecimiento actual.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Listado de roles recuperado.' })
  async findAll(@CurrentEstablishment() estId: number) {
    return this.rolesService.findAll(estId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener rol por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Rol encontrado.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Rol no encontrado.' })
  async findOne(@CurrentEstablishment() estId: number, @Param('id') id: string) {
    return this.rolesService.findOne(+id, estId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar rol' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Rol actualizado.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Rol no encontrado.' })
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar rol', description: 'Borrado lógico del rol.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Rol eliminado.' })
  async remove(@Param('id') id: string) {
    return this.rolesService.remove(+id);
  }

  @Put('/activate/:id')
  @ApiOperation({ summary: 'Restaurar rol', description: 'Reactiva un rol previamente eliminado.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Rol restaurado.' })
  async restore(@Param('id') id: number) {
    return await this.rolesService.restore(id);
  }
}

