import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Procurement, ProcurementSchema } from './schemas/procurement.schema';
import { ProcurementService } from './procurement.service';
import { ProcurementController } from './procurement.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Procurement.name, schema: ProcurementSchema }]),
  ],
  providers: [ProcurementService],
  controllers: [ProcurementController],
  exports: [ProcurementService],
})
export class ProcurementModule {}
