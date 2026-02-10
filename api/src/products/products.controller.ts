import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../auth/enums/role.enum';
import { CreateProductFullDto } from './dto/create-product-full.dto';
import { UpdateProductFullDto } from './dto/update-product-full.dto';
import { CreateProductDetailsDto } from './dto/create-prodestDetails.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger'; // Añadir estas importaciones

@Auth(Role.Admin)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Auth(Role.Admin, Role.Vendedor)
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo producto completo con sus detalles' })
  @ApiBody({
    type: CreateProductFullDto,
    description: 'Datos del producto y sus detalles',
    examples: {
      ejemplo1: {
        summary: 'Ejemplo de creación de producto',
        value: {
          codeReference: 'PROD-001',
          nameProduct: 'Laptop Gamer Pro',
          description: 'Laptop de alto rendimiento para gaming y trabajo profesional',
          idSubCategory: 5,
          stock: 50,
          measurementUnit: 1,
          minStock: 10,
          purchasePrice: 25.50,
          salePrice: 39.99
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error en los datos proporcionados' })
  async create(@Body() createProductDto: CreateProductFullDto) {
    return await this.productsService.create(createProductDto);
  }

  @Auth(Role.Admin, Role.Vendedor)
  @Post('details/:idProduct')
  @ApiOperation({ summary: 'Crear detalles para un producto existente' })
  @ApiBody({
    type: CreateProductDetailsDto,
    description: 'Detalles del producto (stock mínimo, precios)',
    examples: {
      ejemplo1: {
        summary: 'Ejemplo de creación de detalles',
        value: {
          idProduct: 15,
          minStock: 10,
          purchasePrice: 25.50,
          salePrice: 39.99
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Detalles creados exitosamente' })
  @ApiResponse({ status: 400, description: 'Error en los datos proporcionados' })
  async createDetail(@Param('idProduct') idProduct: number, @Body() detail: CreateProductDetailsDto) {
    return await this.productsService.createDetail(idProduct, detail);
  }

  @Auth(Role.Admin, Role.Vendedor)
  @Get()
  async findAll() {
    return await this.productsService.findAll();
  }

  @Auth(Role.Admin, Role.Vendedor)
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.productsService.findOne(+id);
  }

  @Auth(Role.Admin, Role.Vendedor)
  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateProductDto: UpdateProductFullDto) {
    return await this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.productsService.remove(+id);
  }

  @Put('activate/:id')
  async restore(@Param('id') id: number) {
    return await this.productsService.restore(id);
  }
}