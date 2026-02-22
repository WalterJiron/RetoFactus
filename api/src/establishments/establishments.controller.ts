import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EstablishmentsService } from './establishments.service';
import { CreateEstablishmentDto } from './dto/create-establishment.dto';
import { UpdateEstablishmentDto } from './dto/update-establishment.dto';
import { Role } from '../auth/enums/role.enum';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentEstablishment } from '../auth/decorators/get-establishment.decorator';

@Auth(Role.Admin)
@Controller('establishments')
export class EstablishmentsController {
  constructor(private readonly establishmentsService: EstablishmentsService) { }

  @Post()
  create(@Body() createEstablishmentDto: CreateEstablishmentDto) {
    return this.establishmentsService.create(createEstablishmentDto);
  }

  // This endpoint is for the list of all establishments, only for admin users "OF SYSTEM"
  @Get()
  findAll() {
    return this.establishmentsService.findAll();
  }

  // This endpoint is for the establishment of the user that is logged in
  @Get('/id')
  findOne(@CurrentEstablishment() estId: number) {
    return this.establishmentsService.findOne(estId);
  }

  @Patch()
  update(@CurrentEstablishment() estId: number, @Body() updateEstablishmentDto: UpdateEstablishmentDto) {
    return this.establishmentsService.update(estId, updateEstablishmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.establishmentsService.remove(+id);
  }
}
