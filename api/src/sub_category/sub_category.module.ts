import { Module } from '@nestjs/common';
import { SubCategoryService } from './sub_category.service';
import { SubCategoryController } from './sub_category.controller';
import { DatabaseModule } from '../connection/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SubCategoryController],
  providers: [SubCategoryService],
})
export class SubCategoryModule { }
