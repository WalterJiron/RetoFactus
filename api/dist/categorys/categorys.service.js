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
exports.CategorysService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const ResponseValidations_1 = require("../utils/ResponseValidations");
let CategorysService = class CategorysService {
    constructor(db) {
        this.db = db;
    }
    async create({ nameCategory, description }) {
        const result = await this.db.query(`
        SELECT create_category($1, $2) AS message;
      `, [
            nameCategory,
            description,
        ]);
        if (!result.length)
            throw new common_1.BadRequestException('Error al ingresar la categoría.');
        return ResponseValidations_1.ResponseValidation.forMessage(result, "correctamente");
    }
    async findAll() {
        const categorys = await this.db.query(`
        SELECT
          idcategory AS id, namecategory AS name,
          description, datecreate, dateupdate,
          datedelete, active
        FROM category
        ORDER BY idcategory DESC;
      `);
        if (!categorys.length)
            throw new common_1.NotFoundException('No se encontraron categorías en el sistema.');
        return categorys;
    }
    async findOne(id) {
        const category = await this.db.query(`
        SELECT
          idcategory AS id, namecategory AS name,
          description, datecreate, dateupdate,
          datedelete, active
        FROM category
        WHERE idcategory = $1;
      `, [id]);
        if (!category.length)
            throw new common_1.BadRequestException(`No se encontró la categoría con el ID: ${id}`);
        return category;
    }
    async update(id, { nameCategory, description }) {
        const result = await this.db.query(`
        SELECT update_category($1, $2, $3) AS message;
      `, [
            id,
            nameCategory,
            description,
        ]);
        if (!result.length)
            throw new common_1.BadRequestException(`Error al actualizar la categoría con el ID: ${id}`);
        return ResponseValidations_1.ResponseValidation.forMessage(result, "correctamente");
    }
    async remove(id) {
        const result = await this.db.query(`
        SELECT delete_category($1) AS message;
      `, [id]);
        if (!result.length)
            throw new common_1.BadRequestException(`Error al eliminar la categoría con el ID: ${id}`);
        return ResponseValidations_1.ResponseValidation.forMessage(result, "correctamente");
    }
    async restore(id) {
        const result = await this.db.query(`
        SELECT restore_category($1) AS message;
      `, [id]);
        if (!result.length)
            throw new common_1.BadRequestException(`Error al restaurar la categoría con el ID: ${id}`);
        return ResponseValidations_1.ResponseValidation.forMessage(result, "correctamente");
    }
};
exports.CategorysService = CategorysService;
exports.CategorysService = CategorysService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], CategorysService);
//# sourceMappingURL=categorys.service.js.map