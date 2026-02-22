import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEstablishmentDto } from './dto/create-establishment.dto';
import { UpdateEstablishmentDto } from './dto/update-establishment.dto';
import { DataSource } from 'typeorm';
import { ResponseValidation } from '../utils/ResponseValidations';

@Injectable()
export class EstablishmentsService {

  constructor(private readonly db: DataSource) { }

  async create({ name, address, phoneNumber, email, municipalityId }: CreateEstablishmentDto) {
    const result = await this.db.query(
      `
        SELECT create_establishments($1, $2, $3, $4, $5) AS message;
      `,
      [
        name, address, phoneNumber,
        email, municipalityId,
      ]
    );

    return ResponseValidation.forMessage(result, "correctamente");
  }

  async findAll() {
    const establishments = await this.db.query(
      `
        SELECT
          e.IdEstablishment,
          e.Name,
          e.Address,
          e.Phone_Number,
          e.Email,
          e.Municipality_Id,
          e.Active,
          e.DateCreate,
          (SELECT COUNT(*) FROM Roles WHERE IdEstablishment = e.IdEstablishment AND Active = true) AS roles_count,
          (SELECT COUNT(*) FROM Users WHERE IdEstablishment = e.IdEstablishment AND Active = true) AS users_count,
          (SELECT COUNT(*) FROM ProductEstablishments WHERE IdEstablishment = e.IdEstablishment AND Active = true) AS products_count
        FROM Establishments e
        ORDER BY e.IdEstablishment DESC;
      `
    );

    if (!establishments.length) throw new NotFoundException('No se encontraron establecimientos en el sistema');

    return establishments;
  }

  async findOne(id: number) {
    const establishment = await this.db.query(
      `
        SELECT
          e.IdEstablishment,
          e.Name,
          e.Address,
          e.Phone_Number,
          e.Email,
          e.Municipality_Id,
          e.Active,
          e.DateCreate,
          (SELECT COUNT(*) FROM Roles WHERE IdEstablishment = e.IdEstablishment AND Active = true) AS roles_count,
          (SELECT COUNT(*) FROM Users WHERE IdEstablishment = e.IdEstablishment AND Active = true) AS users_count,
          (SELECT COUNT(*) FROM ProductEstablishments WHERE IdEstablishment = e.IdEstablishment AND Active = true) AS products_count
        FROM Establishments e
        WHERE e.IdEstablishment = $1;
      `, [id]
    );

    if (!establishment.length) throw new NotFoundException('Error al buscar tu establecimiento.');

    return establishment;
  }

  async update(id: number, { name, address, phoneNumber, email, municipalityId }: UpdateEstablishmentDto) {
    const result = await this.db.query(
      `
        SELECT update_establishments($1, $2, $3, $4, $5, $6) AS message;
      `,
      [
        id, name, address, phoneNumber,
        email, municipalityId,
      ]
    );

    return ResponseValidation.forMessage(result, "correctamente");
  }

  async remove(id: number) {
    const result = await this.db.query(
      `
        SELECT delete_establishments($1) AS message;
      `, [id]
    );

    return ResponseValidation.forMessage(result, "correctamente")
  }

  async restore(id: number) {
    const result = await this.db.query(
      `
        SELECT restore_establishments($1) AS message;
      `, [id]
    );

    return ResponseValidation.forMessage(result, "correctamente");
  }
}
