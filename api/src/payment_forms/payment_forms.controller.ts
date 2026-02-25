import { Controller, Get, Param, HttpStatus } from '@nestjs/common';
import { PaymentFormsService } from './payment_forms.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../auth/enums/role.enum';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Payment Forms')
@ApiBearerAuth('JWT-auth')
@Auth(Role.Vendedor, Role.Admin)
@Controller('payment-forms')
export class PaymentFormsController {
  constructor(private readonly paymentFormsService: PaymentFormsService) { }

  @Get()
  @ApiOperation({ summary: 'Listar formas de pago', description: 'Obtiene todas las formas de pago disponibles.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Listado de formas de pago recuperado.' })
  findAll() {
    return this.paymentFormsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener forma de pago por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Forma de pago encontrada.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Forma de pago no encontrada.' })
  findOne(@Param('id') id: number) {
    return this.paymentFormsService.findOne(+id);
  }
}

