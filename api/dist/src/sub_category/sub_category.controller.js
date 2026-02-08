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
exports.SubCategoryController = void 0;
const common_1 = require("@nestjs/common");
const sub_category_service_1 = require("./sub_category.service");
const create_sub_category_dto_1 = require("./dto/create-sub_category.dto");
const update_sub_category_dto_1 = require("./dto/update-sub_category.dto");
const auth_decorator_1 = require("../auth/decorators/auth.decorator");
const role_enum_1 = require("../auth/enums/role.enum");
let SubCategoryController = class SubCategoryController {
    constructor(subCategoryService) {
        this.subCategoryService = subCategoryService;
    }
    async create(createSubCategoryDto) {
        return await this.subCategoryService.create(createSubCategoryDto);
    }
    async findAll() {
        return await this.subCategoryService.findAll();
    }
    async findOne(id) {
        return await this.subCategoryService.findOne(+id);
    }
    async update(id, updateSubCategoryDto) {
        return await this.subCategoryService.update(+id, updateSubCategoryDto);
    }
    async remove(id) {
        return await this.subCategoryService.remove(+id);
    }
    async restore(id) {
        return await this.subCategoryService.restore(id);
    }
};
exports.SubCategoryController = SubCategoryController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sub_category_dto_1.CreateSubCategoryDto]),
    __metadata("design:returntype", Promise)
], SubCategoryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubCategoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubCategoryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_sub_category_dto_1.UpdateSubCategoryDto]),
    __metadata("design:returntype", Promise)
], SubCategoryController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubCategoryController.prototype, "remove", null);
__decorate([
    (0, common_1.Put)('activate/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SubCategoryController.prototype, "restore", null);
exports.SubCategoryController = SubCategoryController = __decorate([
    (0, auth_decorator_1.Auth)(role_enum_1.Role.Admin),
    (0, common_1.Controller)('sub-category'),
    __metadata("design:paramtypes", [sub_category_service_1.SubCategoryService])
], SubCategoryController);
//# sourceMappingURL=sub_category.controller.js.map