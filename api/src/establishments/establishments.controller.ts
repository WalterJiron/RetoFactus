import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus } from '@nestjs/common';
import { EstablishmentsService } from './establishments.service';
import { CreateEstablishmentDto } from './dto/create-establishment.dto';
import { UpdateEstablishmentDto } from './dto/update-establishment.dto';
import { Role } from '../auth/enums/role.enum';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentEstablishment } from '../auth/decorators/get-establishment.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Establishments')
@ApiBearerAuth('JWT-auth')
@Auth(Role.Admin)
@Controller('establishments')
export class EstablishmentsController {
  constructor(private readonly establishmentsService: EstablishmentsService) { }

  @Post()
  @ApiOperation({ summary: 'Crear establecimiento', description: 'Registra un nuevo establecimiento comercial.' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Establecimiento creado exitosamente.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos inválidos o email/nombre duplicado.' })
  create(@Body() createEstablishmentDto: CreateEstablishmentDto) {
    return this.establishmentsService.create(createEstablishmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar establecimientos', description: 'Obtiene todos los establecimientos (solo administradores del sistema).' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Listado de establecimientos recuperado.' })
  findAll() {
    return this.establishmentsService.findAll();
  }

  @Get('/id')
  @ApiOperation({ summary: 'Obtener mi establecimiento', description: 'Obtiene los datos del establecimiento del usuario autenticado.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Establecimiento encontrado.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Establecimiento no encontrado.' })
  findOne(@CurrentEstablishment() estId: number) {
    return this.establishmentsService.findOne(estId);
  }

  @Patch()
  @ApiOperation({ summary: 'Actualizar mi establecimiento', description: 'Actualiza los datos del establecimiento del usuario autenticado.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Establecimiento actualizado.' })
  update(@CurrentEstablishment() estId: number, @Body() updateEstablishmentDto: UpdateEstablishmentDto) {
    return this.establishmentsService.update(estId, updateEstablishmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar establecimiento' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Establecimiento eliminado.' })
  remove(@Param('id') id: string) {
    return this.establishmentsService.remove(+id);
  }
}

