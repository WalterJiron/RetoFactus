import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus } from '@nestjs/common';
import { FactusService } from './factus.service';
import { CreateFactusDto } from './dto/create-factus.dto';
import { UpdateFactusDto } from './dto/update-factus.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Factus')
@Controller('factus')
export class FactusController {
  constructor(private readonly factusService: FactusService) { }

  @Post()
  @ApiOperation({ summary: 'Crear factura', description: 'Genera una nueva factura a través de Factus.' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Factura creada exitosamente.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos de facturación inválidos.' })
  create(@Body() createFactusDto: CreateFactusDto) {
    return this.factusService.create(createFactusDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar facturas' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Listado de facturas recuperado.' })
  findAll() {
    return this.factusService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener factura por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Factura encontrada.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Factura no encontrada.' })
  findOne(@Param('id') id: string) {
    return this.factusService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar factura' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Factura actualizada.' })
  update(@Param('id') id: string, @Body() updateFactusDto: UpdateFactusDto) {
    return this.factusService.update(+id, updateFactusDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar factura' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Factura eliminada.' })
  remove(@Param('id') id: string) {
    return this.factusService.remove(+id);
  }
}

