import { Injectable } from '@nestjs/common';
import { CreateEstablishmentDto } from './dto/create-establishment.dto';
import { UpdateEstablishmentDto } from './dto/update-establishment.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class EstablishmentsService {

  constructor(private readonly db: DataSource) { }

  create(createEstablishmentDto: CreateEstablishmentDto) {
    return 'This action adds a new establishment';
  }

  findAll() {
    return `Hiiii!`;
  }

  findOne(id: number) {
    return `This action returns a #${id} establishment`;
  }

  update(id: number, updateEstablishmentDto: UpdateEstablishmentDto) {
    return `This action updates a #${id} establishment`;
  }

  remove(id: number) {
    return `This action removes a #${id} establishment`;
  }
}
