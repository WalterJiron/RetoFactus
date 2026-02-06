import { BadRequestException, Injectable, NotFoundException, Res } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DataSource } from 'typeorm';
import { ResponseValidation } from '../utils/ResponseValidations';

@Injectable()
export class CategorysService {

  constructor(private readonly db: DataSource) { }

  async create({ nameCategory, description }: CreateCategoryDto) {
    const result = await this.db.query(
      `
        SELECT create_category($1, $2) AS message;
      `,
      [
        nameCategory,
        description,
      ]
    );

    if (!result.length) throw new BadRequestException('Error al ingresar la categoría.');

    return ResponseValidation.forMessage(result, "correctamente");
  }

  async findAll() {
    const categorys = await this.db.query(
      `
        SELECT
          idcategory AS id, namecategory AS name,
          description, datecreate, dateupdate,
          datedelete, active
        FROM category
        ORDER BY idcategory DESC;
      `
    );

    if (!categorys.length) throw new NotFoundException('No se encontraron categorías en el sistema.');

    return categorys;
  }

  async findOne(id: number) {
    const category = await this.db.query(
      `
        SELECT
          idcategory AS id, namecategory AS name,
          description, datecreate, dateupdate,
          datedelete, active
        FROM category
        WHERE idcategory = $1;
      `, [id]
    );

    if (!category.length) throw new BadRequestException(`No se encontró la categoría con el ID: ${id}`);

    return category;
  }

  async update(id: number, { nameCategory, description }: UpdateCategoryDto) {
    const result = await this.db.query(
      `
        SELECT update_category($1, $2, $3) AS message;
      `,
      [
        id,
        nameCategory,
        description,
      ]
    );

    if (!result.length) throw new BadRequestException(`Error al actualizar la categoría con el ID: ${id}`);

    return ResponseValidation.forMessage(result, "correctamente");
  }

  async remove(id: number) {
    const result = await this.db.query(
      `
        SELECT delete_category($1) AS message;
      `, [id]
    );

    if (!result.length) throw new BadRequestException(`Error al eliminar la categoría con el ID: ${id}`);

    return ResponseValidation.forMessage(result, "correctamente");
  }

  async restore(id: number) {
    const result = await this.db.query(
      `
        SELECT restore_category($1) AS message;
      `, [id]
    );

    if (!result.length) throw new BadRequestException(`Error al restaurar la categoría con el ID: ${id}`);

    return ResponseValidation.forMessage(result, "correctamente");
  }
}