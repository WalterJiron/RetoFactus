import { Module } from '@nestjs/common';
import { RolesModule } from './roles/roles.module';
import { ConfigModule } from '@nestjs/config';
import dbConfig from './configs/database.config';
import { DatabaseModule } from './connection/database.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategorysModule } from './categorys/categorys.module';
import { AuthModule } from './auth/auth.module';
import { SubCategoryModule } from './sub_category/sub_category.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [dbConfig]
    }),
    DatabaseModule,

    RolesModule,

    UsersModule,

    ProductsModule,

    CategorysModule,

    AuthModule,

    SubCategoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
