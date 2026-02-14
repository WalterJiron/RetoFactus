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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const ResponseValidations_1 = require("../utils/ResponseValidations");
const jwt_1 = require("@nestjs/jwt");
let AuthService = class AuthService {
    constructor(db, jwtService) {
        this.db = db;
        this.jwtService = jwtService;
    }
    async signIn({ email, password }) {
        const searchUser = await this.db.query(`
        SELECT verify_user($1, $2) AS message;
      `, [email, password]);
        if (!searchUser.length)
            throw new common_1.NotFoundException('Error al buscar ususario.');
        const response = ResponseValidations_1.ResponseValidation.forMessage(searchUser, "Ok");
        if (response.status !== 200)
            throw new common_1.UnauthorizedException(response.message);
        return this.createTocken(email);
    }
    async createTocken(email) {
        const user = await this.db.query(`
        SELECT 
          id, establishment, role_name  
        FROM obtener_usuario_por_email($1);
      `, [email]);
        if (!user[0].role_name.length)
            throw new common_1.BadRequestException('Error al buscar usuario.');
        const payload = { sub: user[0]?.id, email: email, role: user[0]?.role_name, establishmentId: user[0]?.establishment };
        const accessToken = await this.jwtService.signAsync(payload);
        return {
            accessToken: accessToken,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map