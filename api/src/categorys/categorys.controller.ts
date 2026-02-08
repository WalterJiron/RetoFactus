import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { CategorysService } from './categorys.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../auth/enums/role.enum';

@Auth(Role.Admin)
@Controller('categorys')
export class CategorysController {
  constructor(private readonly categorysService: CategorysService) { }

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categorysService.create(createCategoryDto);
  }

  @Get()
  async findAll() {
    return await this.categorysService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.categorysService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateCategoryDto: UpdateCategoryDto) {
    return await this.categorysService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.categorysService.remove(+id);
  }

  @Put('activate/:id')
  async restore(@Param('id') id: number) {
    return await this.categorysService.restore(id);
  }
}
