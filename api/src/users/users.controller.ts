import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../auth/enums/role.enum';
import { CurrentEstablishment } from '../auth/decorators/get-establishment.decorator';

@Auth(Role.Admin)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  async create(@CurrentEstablishment() estId: number, @Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(estId, createUserDto);
  }

  @Get()
  async findAll(@CurrentEstablishment() estId: number) {
    return await this.usersService.findAll(estId);
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @CurrentEstablishment() estId: number) {
    return await this.usersService.findOne(+id, estId);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto, @CurrentEstablishment() estId: number) {
    return await this.usersService.update(+id, updateUserDto, estId);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.usersService.remove(+id);
  }

  @Put('/active/:id')
  async restore(@Param('id') id: number) {
    return await this.usersService.restore(+id);
  }
}
