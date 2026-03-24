import { Controller, Get, Post, Body, Patch, Param, Delete, Put, HttpStatus } from '@nestjs/common';
import { SubCategoryService } from './sub_category.service';
import { CreateSubCategoryDto } from './dto/create-sub_category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub_category.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../auth/enums/role.enum';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Subcategories')
@ApiBearerAuth('JWT-auth')
@Auth(Role.Admin)
@Controller('sub-category')
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) { }

  @Post()
  @ApiOperation({ summary: 'Crear subcategoría', description: 'Crea una subcategoría vinculada a una categoría existente.' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Subcategoría creada exitosamente.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos inválidos o categoría padre inexistente.' })
  async create(@Body() createSubCategoryDto: CreateSubCategoryDto) {
    return await this.subCategoryService.create(createSubCategoryDto);
  }

  @Auth(Role.Admin, Role.Vendedor)
  @Get()
  @ApiOperation({ summary: 'Listar subcategorías', description: 'Obtiene todas las subcategorías activas.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Listado de subcategorías recuperado.' })
  async findAll() {
    return await this.subCategoryService.findAll();
  }

  @Auth(Role.Admin, Role.Vendedor)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener subcategoría por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Subcategoría encontrada.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Subcategoría no encontrada.' })
  async findOne(@Param('id') id: string) {
    return await this.subCategoryService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar subcategoría' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Subcategoría actualizada.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Subcategoría no encontrada.' })
  async update(@Param('id') id: string, @Body() updateSubCategoryDto: UpdateSubCategoryDto) {
    return await this.subCategoryService.update(+id, updateSubCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar subcategoría', description: 'Borrado lógico de la subcategoría.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Subcategoría eliminada.' })
  async remove(@Param('id') id: string) {
    return await this.subCategoryService.remove(+id);
  }

  @Put('activate/:id')
  @ApiOperation({ summary: 'Restaurar subcategoría' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Subcategoría restaurada.' })
  async restore(@Param('id') id: number) {
    return await this.subCategoryService.restore(id);
  }
}

