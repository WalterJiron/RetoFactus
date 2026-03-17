import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SaleDetailsService } from './sale_details.service';
import { CreateSaleDetailDto } from './dto/create-sale_detail.dto';
import { UpdateSaleDetailDto } from './dto/update-sale_detail.dto';

@Controller('sale-details')
export class SaleDetailsController {
  constructor(private readonly saleDetailsService: SaleDetailsService) {}

  @Post()
  create(@Body() createSaleDetailDto: CreateSaleDetailDto) {
    return this.saleDetailsService.create(createSaleDetailDto);
  }

  @Get()
  findAll() {
    return this.saleDetailsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.saleDetailsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSaleDetailDto: UpdateSaleDetailDto) {
    return this.saleDetailsService.update(+id, updateSaleDetailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.saleDetailsService.remove(+id);
  }
}
