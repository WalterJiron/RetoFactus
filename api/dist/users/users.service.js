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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const ResponseValidations_1 = require("../utils/ResponseValidations");
let UsersService = class UsersService {
    constructor(db) {
        this.db = db;
    }
    async create({ nameUser, email, password, role }) {
        const result = await this.db.query(`
        SELECT create_users($1, $2, $3, $4) AS message
      `, [
            nameUser,
            email,
            password,
            role,
        ]);
        if (!result.length)
            throw new common_1.BadRequestException('Error interno al crear el usuario.');
        return ResponseValidations_1.ResponseValidation.forMessage(result, "correctamente");
    }
    async findAll() {
        const users = await this.db.query(`
        SELECT
          U.iduser as id,
          U.nameuser as name,
          U.email,
          U.roleuser as id_role,
          R.namer as role_name,
          U.lastlogin,
          U.Datecreate,
          U.DateUpdate,
          U.active
        FROM users AS U
        LEFT JOIN roles AS R
          ON U.roleuser = R.idrole
        ORDER BY U.iduser DESC;
      `);
        if (!users.length)
            throw new common_1.NotFoundException('No hay usuarios ingresados en el sistema.');
        return users;
    }
    async findOne(id) {
        const user = await this.db.query(`
        SELECT
          U.iduser as id,
          U.nameuser as name,
          U.email,
          U.roleuser as id_role,
          R.namer as role_name,
          U.lastlogin,
          U.Datecreate,
          U.DateUpdate,
          U.active
        FROM users AS U
        LEFT JOIN roles AS R
          ON U.roleuser = R.idrole
        WHERE U.iduser = $1
        ORDER BY U.iduser DESC;
      `, [id]);
        if (!user.length)
            throw new common_1.BadRequestException(`El usuario con el id ${id} no se encuentra en el sistema.`);
        return user;
    }
    async update(id, { nameUser, email, password, role }) {
        const result = await this.db.query(`
        SELECT update_users($1, $2, $3, $4, $5) AS message;
      `, [
            id, nameUser,
            email, password, role,
        ]);
        if (!result.length)
            throw new common_1.BadRequestException('Error al actualizar el usuario.');
        return ResponseValidations_1.ResponseValidation.forMessage(result, "correctamente");
    }
    async remove(id) {
        const result = await this.db.query(`
        SELECT delete_users($1) AS message
      `, [id]);
        if (!result.length)
            throw new common_1.BadRequestException(`Error al eliminar el usuario con el id: ${id}`);
        return ResponseValidations_1.ResponseValidation.forMessage(result, "correctamente");
    }
    async restore(id) {
        const result = await this.db.query(`
        SELECT restore_users($1) AS message;
      `, [id]);
        if (!result.length)
            throw new common_1.BadRequestException(`Error al restaurar el usuario con ID: ${id}`);
        return ResponseValidations_1.ResponseValidation.forMessage(result, "correctamente");
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], UsersService);
//# sourceMappingURL=users.service.js.map