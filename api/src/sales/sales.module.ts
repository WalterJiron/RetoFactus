import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { DatabaseModule } from '../connection/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule { }
