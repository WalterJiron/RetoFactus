import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { SubCategoryService } from './sub_category.service';
import { CreateSubCategoryDto } from './dto/create-sub_category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub_category.dto';

@Controller('sub-category')
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) { }

  @Post()
  async create(@Body() createSubCategoryDto: CreateSubCategoryDto) {
    return await this.subCategoryService.create(createSubCategoryDto);
  }

  @Get()
  async findAll() {
    return await this.subCategoryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.subCategoryService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateSubCategoryDto: UpdateSubCategoryDto) {
    return await this.subCategoryService.update(+id, updateSubCategoryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.subCategoryService.remove(+id);
  }

  @Put('activate/:id')
  async restore(@Param('id') id: number) {
    return await this.subCategoryService.restore(id);
  }
}
