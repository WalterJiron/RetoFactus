"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubCategoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const ResponseValidations_1 = require("../utils/ResponseValidations");
let SubCategoryService = class SubCategoryService {
    constructor(db) {
        this.db = db;
    }
    async create({ nameSubCategory, description, categorySub }) {
        const result = await this.db.query(`
        SELECT create_subcategory($1, $2, $3) AS message;
      `, [
            nameSubCategory,
            description,
            categorySub,
        ]);
        if (!result.length)
            throw new common_1.BadRequestException('Error al ingresar la subcategoría.');
        return ResponseValidations_1.ResponseValidation.forMessage(result, "correctamente");
    }
    async findAll() {
        const subCategorys = await this.db.query(`
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
      `);
        if (!subCategorys.length)
            throw new common_1.NotFoundException('No se encontraron subcategorías en el sistema.');
        return subCategorys;
    }
    async findOne(id) {
        const subCategory = await this.db.query(`
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
      `, [id]);
        if (!subCategory.length)
            throw new common_1.BadRequestException(`La subcategoría con el ID ${id} no se encuentra en el sistema.`);
        return subCategory;
    }
    async update(id, { nameSubCategory, description, categorySub }) {
        const result = await this.db.query(`
        SELECT update_subcategory($1, $2, $3, $4) AS message;
      `, [
            id, nameSubCategory,
            description, categorySub,
        ]);
        if (!result.length)
            throw new common_1.BadRequestException(`Error al actualizar la subcategoría con el ID ${id}`);
        return ResponseValidations_1.ResponseValidation.forMessage(result, "correctamente");
    }
    async remove(id) {
        const result = await this.db.query(`
      SELECT delete_subcategory($1) AS message;
    `, [id]);
        if (!result.length)
            throw new common_1.BadRequestException(`Error al eliminar la subcategoría con el ID ${id}`);
        return ResponseValidations_1.ResponseValidation.forMessage(result, "correctamente");
    }
    async restore(id) {
        const result = await this.db.query(`
        SELECT restore_subcategory($1) AS message;
      `, [id]);
        if (!result)
            throw new common_1.BadRequestException(`Error al restaurar la subcategoría con el ID: ${id}`);
        return ResponseValidations_1.ResponseValidation.forMessage(result, "correctamente");
    }
};
exports.SubCategoryService = SubCategoryService;
exports.SubCategoryService = SubCategoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], SubCategoryService);
//# sourceMappingURL=sub_category.service.js.map