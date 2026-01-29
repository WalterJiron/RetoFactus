import { Module } from '@nestjs/common';
import { RolesModule } from './roles/roles.module';
import { ConfigModule } from '@nestjs/config';
import dbConfig from './configs/database.config';
import { DatabaseModule } from './connection/database.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
