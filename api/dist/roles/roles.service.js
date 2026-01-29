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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let RolesService = class RolesService {
    constructor(db) {
        this.db = db;
    }
    create(createRoleDto) {
        return 'This action adds a new role';
    }
    async findAll() {
        const roles = await this.db.query(`
        SELECT
          idrole as id,
            namer as name_rol,
            description,
            TO_CHAR(
                datecreate AT TIME ZONE 'America/Managua',
                'DD/MM/YYYY HH12:MI AM'
            ) as datecreate_local,
            active
        FROM roles
        ORDER BY idrole DESC;
      `);
        if (!roles.length)
            throw new common_1.NotFoundException('No hay roles registrados');
        return roles;
    }
    async findOne(id) {
        const role = await this.db.query(`
        SELECT
          idrole as id,
            namer as name_rol,
            description,
            TO_CHAR(
                datecreate AT TIME ZONE 'America/Managua',
                'DD/MM/YYYY HH12:MI AM'
            ) as datecreate_local,
            active
        FROM roles
        WHERE idrole = $1;
      `, [id]);
        if (!role.length)
            throw new common_1.BadRequestException(`El rol con id ${id} no existe`);
        return role[0];
    }
    update(id, updateRoleDto) {
        return `This action updates a #${id} role`;
    }
    remove(id) {
        return `This action removes a #${id} role`;
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], RolesService);
//# sourceMappingURL=roles.service.js.map