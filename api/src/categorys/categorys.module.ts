import { Module } from '@nestjs/common';
import { CategorysService } from './categorys.service';
import { CategorysController } from './categorys.controller';
import { DatabaseModule } from '../connection/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CategorysController],
  providers: [CategorysService],
})
export class CategorysModule { }
