import { Injectable } from '@nestjs/common';
import { CreateSaleDetailDto } from './dto/create-sale_detail.dto';
import { UpdateSaleDetailDto } from './dto/update-sale_detail.dto';

@Injectable()
export class SaleDetailsService {
  create(createSaleDetailDto: CreateSaleDetailDto) {
    return 'This action adds a new saleDetail';
  }

  findAll() {
    return `This action returns all saleDetails`;
  }

  findOne(id: number) {
    return `This action returns a #${id} saleDetail`;
  }

  update(id: number, updateSaleDetailDto: UpdateSaleDetailDto) {
    return `This action updates a #${id} saleDetail`;
  }

  remove(id: number) {
    return `This action removes a #${id} saleDetail`;
  }
}
