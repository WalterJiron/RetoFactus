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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategorysController = void 0;
const common_1 = require("@nestjs/common");
const categorys_service_1 = require("./categorys.service");
const create_category_dto_1 = require("./dto/create-category.dto");
const update_category_dto_1 = require("./dto/update-category.dto");
const auth_decorator_1 = require("../auth/decorators/auth.decorator");
const role_enum_1 = require("../auth/enums/role.enum");
let CategorysController = class CategorysController {
    constructor(categorysService) {
        this.categorysService = categorysService;
    }
    async create(createCategoryDto) {
        return await this.categorysService.create(createCategoryDto);
    }
    async findAll() {
        return await this.categorysService.findAll();
    }
    async findOne(id) {
        return await this.categorysService.findOne(+id);
    }
    async update(id, updateCategoryDto) {
        return await this.categorysService.update(+id, updateCategoryDto);
    }
    async remove(id) {
        return await this.categorysService.remove(+id);
    }
    async restore(id) {
        return await this.categorysService.restore(id);
    }
};
exports.CategorysController = CategorysController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_category_dto_1.CreateCategoryDto]),
    __metadata("design:returntype", Promise)
], CategorysController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CategorysController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CategorysController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_category_dto_1.UpdateCategoryDto]),
    __metadata("design:returntype", Promise)
], CategorysController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CategorysController.prototype, "remove", null);
__decorate([
    (0, common_1.Put)('activate/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CategorysController.prototype, "restore", null);
exports.CategorysController = CategorysController = __decorate([
    (0, auth_decorator_1.Auth)(role_enum_1.Role.Admin),
    (0, common_1.Controller)('categorys'),
    __metadata("design:paramtypes", [categorys_service_1.CategorysService])
], CategorysController);
//# sourceMappingURL=categorys.controller.js.map