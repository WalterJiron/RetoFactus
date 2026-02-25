import { Controller, Get, Post, Body, Patch, Param, Delete, Put, HttpStatus } from '@nestjs/common';
import { CategorysService } from './categorys.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../auth/enums/role.enum';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Categories')
@ApiBearerAuth('JWT-auth')
@Auth(Role.Admin)
@Controller('categorys')
export class CategorysController {
  constructor(private readonly categorysService: CategorysService) { }

  @Post()
  @ApiOperation({ summary: 'Crear categoría', description: 'Crea una nueva categoría de productos.' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Categoría creada exitosamente.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos de entrada inválidos o nombre duplicado.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado.' })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categorysService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar categorías', description: 'Obtiene todas las categorías activas.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Listado de categorías recuperado.' })
  async findAll() {
    return await this.categorysService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener categoría por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Categoría encontrada.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Categoría no encontrada.' })
  async findOne(@Param('id') id: number) {
    return await this.categorysService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar categoría', description: 'Actualiza parcialmente los datos de una categoría.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Categoría actualizada.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Categoría no encontrada.' })
  async update(@Param('id') id: number, @Body() updateCategoryDto: UpdateCategoryDto) {
    return await this.categorysService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar categoría', description: 'Borrado lógico de la categoría.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Categoría eliminada.' })
  async remove(@Param('id') id: number) {
    return await this.categorysService.remove(+id);
  }

  @Put('activate/:id')
  @ApiOperation({ summary: 'Restaurar categoría', description: 'Reactiva una categoría previamente eliminada.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Categoría restaurada.' })
  async restore(@Param('id') id: number) {
    return await this.categorysService.restore(id);
  }
}

