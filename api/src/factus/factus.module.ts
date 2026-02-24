import { Module } from '@nestjs/common';
import { FactusService } from './factus.service';
import { FactusController } from './factus.controller';

@Module({
  controllers: [FactusController],
  providers: [FactusService],
})
export class FactusModule {}
