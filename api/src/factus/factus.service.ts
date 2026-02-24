import { Injectable } from '@nestjs/common';
import { CreateFactusDto } from './dto/create-factus.dto';
import { UpdateFactusDto } from './dto/update-factus.dto';

@Injectable()
export class FactusService {
  create(createFactusDto: CreateFactusDto) {
    return 'This action adds a new factus';
  }

  findAll() {
    return `This action returns all factus`;
  }

  findOne(id: number) {
    return `This action returns a #${id} factus`;
  }

  update(id: number, updateFactusDto: UpdateFactusDto) {
    return `This action updates a #${id} factus`;
  }

  remove(id: number) {
    return `This action removes a #${id} factus`;
  }
}
