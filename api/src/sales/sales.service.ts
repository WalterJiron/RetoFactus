import { Injectable } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class SalesService {

  constructor(private readonly db: DataSource) { }

  async create(createSaleDto: CreateSaleDto, estId: number) {
    return 'This action adds a new sale';
  }

  async findAll(estId: number) {
    return `This action returns all sales`;
  }

  async findOne(id: number, estId: number) {
    return `This action returns a #${id} sale`;
  }

  async update(id: number, updateSaleDto: UpdateSaleDto, estId: number) {
    return `This action updates a #${id} sale`;
  }

  async remove(id: number, estId: number) {
    return `This action removes a #${id} sale`;
  }

  async restore(id: number, estId: number) {
    return `This action restores a #${id} sale`;
  }
}
