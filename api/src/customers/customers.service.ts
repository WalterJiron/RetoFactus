import { BadRequestException, Injectable, NotFoundException, Res } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { DataSource, NumericType } from 'typeorm';
import { ResponseValidation } from '../utils/ResponseValidations';

@Injectable()
export class CustomersService {

  constructor(private readonly db: DataSource) { }

  async create(estId: number, createCustomerDto: CreateCustomerDto) {
    const resultCreate = await this.db.query(
      `
        SELECT create_customers($1, $2, $3, $4, $5, $6, $7, $8, $9) AS message;
      `,
      [
        createCustomerDto.identification,
        createCustomerDto.names,
        createCustomerDto.address,
        createCustomerDto.email,
        createCustomerDto.phone,
        21, // default tributeId
        createCustomerDto.identificationDocumentId,
        createCustomerDto.municipalityId,
        estId,
      ]
    );

    if (!resultCreate.length) throw new BadRequestException('Error al crear el cliente.');

    return ResponseValidation.forMessage(resultCreate, "correctamente");
  }

  async findAll(estId: number) {
    const customers = await this.db.query(
      `
        SELECT
          c.IdCustomer,
          c.Identification,
          c.Names,
          c.Address,
          c.Email,
          c.Phone,
          c.TributeId,
          c.IdentificationDocumentId,
          c.MunicipalityId,
          c.IdEstablishment,
          e.Name AS EstablishmentName,

          (
            SELECT COUNT(*)
            FROM Sale s
            WHERE s.CustomerId = c.IdCustomer
              AND s.EstablishmentId = c.IdEstablishment
          ) AS TotalSalesInEstablishment,
          
          c.DateCreate,
          c.DateUpdate,
          c.DateDelete,
          c.Active
        FROM Customers c
        INNER JOIN Establishments e ON c.IdEstablishment = e.IdEstablishment
        WHERE c.IdEstablishment = $1
        ORDER BY c.DateCreate DESC;
      `, [estId]
    );

    if (!customers.length) throw new NotFoundException("No hay clientes registrados en el sistema.");

    return customers;
  }

  async findOne(id: number, estId: number) {
    const customer = await this.db.query(
      `
        SELECT
          c.IdCustomer,
          c.Identification,
          c.Names,
          c.Address,
          c.Email,
          c.Phone,
          c.TributeId,
          c.IdentificationDocumentId,
          c.MunicipalityId,
          c.IdEstablishment,
          e.Name AS EstablishmentName,

          (
            SELECT COUNT(*)
            FROM Sale s
            WHERE s.CustomerId = c.IdCustomer
              AND s.EstablishmentId = c.IdEstablishment
          ) AS TotalSalesInEstablishment,

          c.DateCreate,
          c.DateUpdate,
          c.DateDelete,
          c.Active
        FROM Customers c
        INNER JOIN Establishments e ON c.IdEstablishment = e.IdEstablishment
        WHERE c.IdEstablishment = $1 AND c.IdCustomer = $2
        ORDER BY c.DateCreate DESC;
      `, [estId, id]
    );

    if (!customer.length) throw new NotFoundException(`El Cliente con el ID (${id}) no existe en el sistema.`);

    return customer;
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto, estId: number) {
    const permissions = await this.validatePermissions(id, estId, 'actualizar');
    if (permissions.status !== 200) throw new BadRequestException(permissions.message);

    const customerUpdate = await this.db.query(
      `
        SELECT update_customers($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) AS message;
      `,
      [
        id, updateCustomerDto.identification,
        updateCustomerDto.names,
        updateCustomerDto.address,
        updateCustomerDto.email,
        updateCustomerDto.phone,
        21, // default tributeId
        updateCustomerDto.identificationDocumentId,
        updateCustomerDto.municipalityId,
        estId,
      ]
    );

    if (!customerUpdate.length) throw new BadRequestException('Error al actualizar el cliente.');

    return ResponseValidation.forMessage(customerUpdate, "correctamente");
  }

  async remove(id: number, estId: number) {
    const permissions = await this.validatePermissions(id, estId, 'eliminar');
    if (permissions.status !== 200) throw new BadRequestException(permissions.message);

    const customerDelete = await this.db.query(
      `
        SELECT delete_customers($1) AS message;
      `, [id]
    );

    if (customerDelete.length) throw new BadRequestException('Error al eliminar el cliente.');

    return ResponseValidation.forMessage(customerDelete, "correctamente")

  }

  async restore(id: number, estId: number) {
    const permissions = await this.validatePermissions(id, estId, 'restaurar');
    if (permissions.status !== 200) throw new BadRequestException(permissions.message);

    const customerRestore = await this.db.query(
      `
        SELECT restore_customers($1) AS message;
      `, [id]
    );

    if (customerRestore.length) throw new BadRequestException('Error al restaurar el cliente.');

    return ResponseValidation.forMessage(customerRestore, "correctamente");
  }

  /**
   * 
   * @param idcustomer is the id of the customer to validate if the establishment has permissions to perform the action
   * @param idestablishment is the id of the establishment to validate if it has permissions to perform the action on the customer
   * @param action is the action that the establishment wants to perform on the customer, used for the error message if the establishment does not have permissions
   * @returns json with message and status code.
   */
  private async validatePermissions(idcustomer: number, idestablishment: number, action: string): Promise<{ message: string, status: number }> {
    const validateEstablishment = await this.db.query(
      `
          SELECT
            idestablishment as result
          FROM customers
          WHERE idcustomer = $1;
        `, [idcustomer]
    );


    if (!validateEstablishment.length) return { message: 'Cliente no encontrado.', status: 404 };

    if (validateEstablishment[0].result !== idestablishment) return { message: `No tiene permisos para ${action} este cliente.`, status: 403 };

    return { message: 'Permisos validados.', status: 200 };

  }
}
