import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { UpdateSaleStatusDto, SaleStatus } from './dto/update-sale-status.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../auth/enums/role.enum';
import { CurrentEstablishment } from '../auth/decorators/get-establishment.decorator';

@ApiTags('Sales')
@ApiBearerAuth('JWT-auth')
@Auth(Role.Admin, Role.Vendedor)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  // ───────────────────────────────────────────────────────────────────────────
  // POST  /sales
  // ───────────────────────────────────────────────────────────────────────────
  @Post()
  @ApiOperation({
    summary: 'Crear una nueva venta',
    description:
      'Registra una venta con sus detalles de productos. ' +
      'Valida existencias, stock disponible y actualiza el inventario automáticamente. ' +
      'El establecimiento se obtiene del token JWT.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description:
      'Venta creada exitosamente. Retorna el mensaje de confirmación con el ID y código de referencia.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Datos inválidos, stock insuficiente, producto inactivo o referencias no encontradas.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido.',
  })
  async create(
    @CurrentEstablishment() estId: number,
    @Body() createSaleDto: CreateSaleDto,
  ) {
    return await this.salesService.create(createSaleDto, estId);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // GET  /sales
  // ───────────────────────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: 'Listar todas las ventas del establecimiento',
    description:
      'Obtiene el listado completo de ventas del establecimiento autenticado, ' +
      'incluyendo datos del cliente, forma de pago y totales.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Listado de ventas recuperado exitosamente.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No hay ventas registradas para este establecimiento.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido.',
  })
  async findAll(@CurrentEstablishment() estId: number) {
    return await this.salesService.findAll(estId);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // GET  /sales/:id
  // ───────────────────────────────────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una venta por ID',
    description:
      'Retorna la información completa de una venta específica junto con ' +
      'sus líneas de detalle (productos, cantidades, precios, impuestos).',
  })
  @ApiParam({
    name: 'id',
    description: 'ID interno de la venta (IdInternal)',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Venta encontrada exitosamente con sus detalles.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Venta no encontrada o no pertenece al establecimiento.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido.',
  })
  async findOne(
    @Param('id') id: number,
    @CurrentEstablishment() estId: number,
  ) {
    return await this.salesService.findOne(+id, estId);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PATCH  /sales/:id
  // ───────────────────────────────────────────────────────────────────────────
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar una venta',
    description:
      'Permite actualizar una venta que se encuentre en estado **pending**. ' +
      'Si se envían nuevos detalles, se reemplaza el listado completo anterior, ' +
      'se revierte el stock descontado y se aplica el nuevo. ' +
      'Los campos no enviados conservan su valor actual.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID interno de la venta a actualizar',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Venta actualizada correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'La venta no existe, no está en estado pendiente, stock insuficiente o datos inválidos.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido.',
  })
  async update(
    @Param('id') id: number,
    @Body() updateSaleDto: UpdateSaleDto,
    @CurrentEstablishment() estId: number,
  ) {
    return await this.salesService.update(+id, updateSaleDto, estId);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PATCH  /sales/:id/status
  // ───────────────────────────────────────────────────────────────────────────
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Cambiar el estado de una venta',
    description:
      'Actualiza el campo **Status** de una venta. ' +
      'Solo se permiten las siguientes transiciones:\n\n' +
      '| Estado actual | → | Estado nuevo | Efecto en stock |\n' +
      '|---|---|---|---|\n' +
      '| `pending` | → | `completed` | Sin cambio |\n' +
      '| `pending` | → | `cancelled` | Stock devuelto |\n' +
      '| `cancelled` | → | `pending` | Stock descontado |\n\n' +
      'Una venta en estado `completed` no puede cambiar de estado.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID interno de la venta',
    example: 1,
    type: Number,
  })
  @ApiBody({ type: UpdateSaleStatusDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado de la venta actualizado correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Transición de estado no permitida, venta eliminada, ya en ese estado, o venta completada.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido.',
  })
  async updateStatus(
    @Param('id') id: number,
    @Body() updateSaleStatusDto: UpdateSaleStatusDto,
    @CurrentEstablishment() estId: number,
  ) {
    return await this.salesService.updateStatus(+id, updateSaleStatusDto, estId);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // DELETE  /sales/:id
  // ───────────────────────────────────────────────────────────────────────────
  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar una venta (soft delete)',
    description:
      'Realiza una eliminación lógica de una venta en estado **pending** ' +
      'que no tenga recibos asociados. La venta y sus detalles quedan marcados como inactivos.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID interno de la venta a eliminar',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Venta eliminada correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'La venta no existe, no está en estado pendiente o tiene recibos asociados.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido.',
  })
  async remove(
    @Param('id') id: number,
    @CurrentEstablishment() estId: number,
  ) {
    return await this.salesService.remove(+id, estId);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PUT  /sales/activate/:id
  // ───────────────────────────────────────────────────────────────────────────
  @Put('activate/:id')
  @ApiOperation({
    summary: 'Restaurar una venta eliminada',
    description:
      'Reactiva una venta que fue eliminada lógicamente. ' +
      'Si la venta estaba en estado **pending**, valida que haya stock suficiente ' +
      'y descuenta el inventario nuevamente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID interno de la venta a restaurar',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Venta restaurada correctamente.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'La venta no existe, ya está activa, stock insuficiente o referencias inactivas.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT ausente o inválido.',
  })
  async restore(
    @Param('id') id: number,
    @CurrentEstablishment() estId: number,
  ) {
    return await this.salesService.restore(+id, estId);
  }
}
