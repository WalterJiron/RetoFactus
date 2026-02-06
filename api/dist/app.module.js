"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const roles_module_1 = require("./roles/roles.module");
const config_1 = require("@nestjs/config");
const database_config_1 = require("./configs/database.config");
const database_module_1 = require("./connection/database.module");
const users_module_1 = require("./users/users.module");
const products_module_1 = require("./products/products.module");
const categorys_module_1 = require("./categorys/categorys.module");
const auth_module_1 = require("./auth/auth.module");
const sub_category_module_1 = require("./sub_category/sub_category.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [database_config_1.default]
            }),
            database_module_1.DatabaseModule,
            roles_module_1.RolesModule,
            users_module_1.UsersModule,
            products_module_1.ProductsModule,
            categorys_module_1.CategorysModule,
            auth_module_1.AuthModule,
            sub_category_module_1.SubCategoryModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map