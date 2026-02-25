import { Controller, Get, Post, Body, Patch, Param, Delete, Put, HttpStatus } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../auth/enums/role.enum';
import { CreateProductFullDto } from './dto/create-product-full.dto';
import { UpdateProductFullDto } from './dto/update-product-full.dto';
import { CreateProductDetailsDto } from './dto/create-prodestDetails.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentEstablishment } from '../auth/decorators/get-establishment.decorator';

@ApiTags('Products')
@ApiBearerAuth('JWT-auth')
@Auth(Role.Admin)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Auth(Role.Admin, Role.Vendedor)
  @Post()
  @ApiOperation({
    summary: 'Crear producto completo',
    description: 'Crea un nuevo producto junto con sus detalles de precio y stock.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Producto y detalles creados exitosamente.',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado.' })
  async create(@CurrentEstablishment() estId: number, @Body() createProductDto: CreateProductFullDto) {
    return await this.productsService.create(estId, createProductDto);
  }

  @Auth(Role.Admin, Role.Vendedor)
  @Post('details/:idProduct')
  @ApiOperation({
    summary: 'Agregar detalles a producto',
    description: 'Permite añadir precios y stock mínimo a un producto ya existente.',
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Detalles agregados correctamente.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Producto no encontrado.' })
  async createDetail(@Param('idProduct') idProduct: number, @Body() detail: CreateProductDetailsDto) {
    return await this.productsService.createDetail(idProduct, detail);
  }

  @Auth(Role.Admin, Role.Vendedor)
  @Get()
  @ApiOperation({ summary: 'Listar productos', description: 'Obtiene todos los productos del establecimiento actual.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Listado de productos recuperado.' })
  async findAll(@CurrentEstablishment() estId: number) {
    return await this.productsService.findAll(estId);
  }

  @Auth(Role.Admin, Role.Vendedor)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener producto por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Producto encontrado.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Producto no encontrado.' })
  async findOne(@CurrentEstablishment() estId: number, @Param('id') id: number) {
    return await this.productsService.findOne(estId, +id);
  }

  @Auth(Role.Admin, Role.Vendedor)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar producto', description: 'Permite actualizar parcialmente los datos de un producto y sus detalles.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Producto actualizado correctamente.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Producto o detalle no encontrado.' })
  async update(@Param('id') id: number, @Body() updateProductDto: UpdateProductFullDto) {
    return await this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar producto', description: 'Realiza un borrado lógico del producto.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Producto eliminado.' })
  async remove(@CurrentEstablishment() estId: number, @Param('id') id: number) {
    return await this.productsService.remove(estId, +id);
  }

  @Put('activate/:id')
  @ApiOperation({ summary: 'Restaurar producto', description: 'Reactiva un producto previamente eliminado.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Producto restaurado exitosamente.' })
  async restore(@CurrentEstablishment() estId: number, @Param('id') id: number) {
    return await this.productsService.restore(estId, id);
  }
}