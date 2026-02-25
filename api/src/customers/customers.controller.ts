import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../auth/enums/role.enum';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Customers')
@ApiBearerAuth('JWT-auth')
@Auth(Role.Admin, Role.Vendedor)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) { }

  @Post()
  @ApiOperation({ summary: 'Crear cliente', description: 'Registra un nuevo cliente para facturación.' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Cliente creado exitosamente.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos inválidos o identificación/email duplicado.' })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar clientes', description: 'Obtiene todos los clientes registrados.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Listado de clientes recuperado.' })
  findAll() {
    return this.customersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cliente por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Cliente encontrado.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cliente no encontrado.' })
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar cliente', description: 'Actualiza parcialmente los datos de un cliente.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Cliente actualizado.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cliente no encontrado.' })
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customersService.update(+id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar cliente' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Cliente eliminado.' })
  remove(@Param('id') id: string) {
    return this.customersService.remove(+id);
  }
}

