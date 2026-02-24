import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FactusService } from './factus.service';
import { CreateFactusDto } from './dto/create-factus.dto';
import { UpdateFactusDto } from './dto/update-factus.dto';

@Controller('factus')
export class FactusController {
  constructor(private readonly factusService: FactusService) {}

  @Post()
  create(@Body() createFactusDto: CreateFactusDto) {
    return this.factusService.create(createFactusDto);
  }

  @Get()
  findAll() {
    return this.factusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.factusService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFactusDto: UpdateFactusDto) {
    return this.factusService.update(+id, updateFactusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.factusService.remove(+id);
  }
}
