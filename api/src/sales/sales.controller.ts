import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { CurrentEstablishment } from '../auth/decorators/get-establishment.decorator';

@ApiTags('Sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) { }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva venta' })
  @ApiResponse({ status: 201, description: 'La venta ha sido creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  create(@Body() createSaleDto: CreateSaleDto, @CurrentEstablishment() estId: number) {
    return this.salesService.create(createSaleDto, estId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las ventas del establecimiento' })
  @ApiResponse({ status: 200, description: 'Lista de ventas obtenida exitosamente.' })
  findAll(@CurrentEstablishment() estId: number) {
    return this.salesService.findAll(estId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una venta por su ID' })
  @ApiParam({ name: 'id', description: 'ID de la venta' })
  @ApiResponse({ status: 200, description: 'Venta encontrada.' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada.' })
  findOne(@Param('id') id: string, @CurrentEstablishment() estId: number) {
    return this.salesService.findOne(+id, estId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una venta existente' })
  @ApiParam({ name: 'id', description: 'ID de la venta a actualizar' })
  @ApiResponse({ status: 200, description: 'La venta ha sido actualizada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada.' })
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto, @CurrentEstablishment() estId: number) {
    return this.salesService.update(+id, updateSaleDto, estId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una venta' })
  @ApiParam({ name: 'id', description: 'ID de la venta a eliminar' })
  @ApiResponse({ status: 200, description: 'La venta ha sido eliminada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada.' })
  remove(@Param('id') id: string, @CurrentEstablishment() estId: number) {
    return this.salesService.remove(+id, estId);
  }
}
