import { Controller, Get, Post, Body, Patch, Param, Delete, Put, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../auth/enums/role.enum';
import { CurrentEstablishment } from '../auth/decorators/get-establishment.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Auth(Role.Admin)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiOperation({ summary: 'Crear usuario', description: 'Registra un nuevo usuario dentro del establecimiento actual.' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Usuario creado exitosamente.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos inválidos o email duplicado.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado.' })
  async create(@CurrentEstablishment() estId: number, @Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(estId, createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar usuarios', description: 'Obtiene todos los usuarios del establecimiento actual.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Listado de usuarios recuperado.' })
  async findAll(@CurrentEstablishment() estId: number) {
    return await this.usersService.findAll(estId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Usuario encontrado.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Usuario no encontrado.' })
  async findOne(@Param('id') id: number, @CurrentEstablishment() estId: number) {
    return await this.usersService.findOne(+id, estId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario', description: 'Actualiza parcialmente los datos de un usuario.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Usuario actualizado.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Usuario no encontrado.' })
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto, @CurrentEstablishment() estId: number) {
    return await this.usersService.update(+id, updateUserDto, estId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario', description: 'Borrado lógico del usuario.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Usuario eliminado.' })
  async remove(@Param('id') id: number) {
    return await this.usersService.remove(+id);
  }

  @Put('/activate/:id')
  @ApiOperation({ summary: 'Restaurar usuario', description: 'Reactiva un usuario previamente eliminado.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Usuario restaurado.' })
  async restore(@Param('id') id: number) {
    return await this.usersService.restore(+id);
  }
}

