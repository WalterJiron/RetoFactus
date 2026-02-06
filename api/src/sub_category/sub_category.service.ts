import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubCategoryDto } from './dto/create-sub_category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub_category.dto';
import { DataSource } from 'typeorm';
import { ResponseValidation } from '../utils/ResponseValidations';

@Injectable()
export class SubCategoryService {

  constructor(private readonly db: DataSource) { }

  async create({ nameSubCategory, description, categorySub }: CreateSubCategoryDto) {
    const result = await this.db.query(
      `
        SELECT create_subcategory($1, $2, $3) AS message;
      `,
      [
        nameSubCategory,
        description,
        categorySub,
      ]
    );

    if (!result.length) throw new BadRequestException('Error al ingresar la subcategoría.');

    return ResponseValidation.forMessage(result, "correctamente");
  }

  async findAll() {
    const subCategorys = await this.db.query(
      `
        SELECT
          SUBCAT.idsubcategory AS ID,
          SUBCAT.namesubcategory AS name,
          SUBCAT.description,
          SUBCAT.categorysub AS IdCategory,
          CAT.namecategory AS nameCategory,
          CAT.description AS descriptionCategory,
          SUBCAT.datecreate,
          SUBCAT.dateupdate,
          SUBCAT.datedelete,
          SUBCAT.active
        FROM subcategory AS SUBCAT
        LEFT JOIN category AS CAT
          ON 	CAT.idcategory = SUBCAT.categorysub
        ORDER BY SUBCAT.categorysub DESC;
      `
    );

    if (!subCategorys.length) throw new NotFoundException('No se encontraron subcategorías en el sistema.');

    return subCategorys;
  }

  async findOne(id: number) {
    const subCategory = await this.db.query(
      `
        SELECT
          SUBCAT.idsubcategory AS ID,
          SUBCAT.namesubcategory AS name,
          SUBCAT.description,
          SUBCAT.categorysub AS IdCategory,
          CAT.namecategory AS nameCategory,
          CAT.description AS descriptionCategory,
          SUBCAT.datecreate,
          SUBCAT.dateupdate,
          SUBCAT.datedelete,
          SUBCAT.active
        FROM subcategory AS SUBCAT
        LEFT JOIN category AS CAT
          ON 	CAT.idcategory = SUBCAT.categorysub
        WHERE SUBCAT.idsubcategory = $1;
      `, [id]
    );

    if (!subCategory.length) throw new BadRequestException(`La subcategoría con el ID ${id} no se encuentra en el sistema.`);

    return subCategory;
  }

  async update(id: number, { nameSubCategory, description, categorySub }: UpdateSubCategoryDto) {
    const result = await this.db.query(
      `
        SELECT update_subcategory($1, $2, $3, $4) AS message;
      `,
      [
        id, nameSubCategory,
        description, categorySub,
      ]
    );

    if (!result.length) throw new BadRequestException(`Error al actualizar la subcategoría con el ID ${id}`);

    return ResponseValidation.forMessage(result, "correctamente");
  }

  async remove(id: number) {
    const result = await this.db.query(
      `
      SELECT delete_subcategory($1) AS message;
    `, [id]
    );

    if (!result.length) throw new BadRequestException(`Error al eliminar la subcategoría con el ID ${id}`);

    return ResponseValidation.forMessage(result, "correctamente");
  }

  async restore(id: number) {
    const result = await this.db.query(
      `
        SELECT restore_subcategory($1) AS message;
      `, [id]
    );

    if (!result) throw new BadRequestException(`Error al restaurar la subcategoría con el ID: ${id}`);

    return ResponseValidation.forMessage(result, "correctamente");
  }
}