import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Farmer, FarmerSchema } from '../farmers/schemas/farmer.schema';
import { Farm, FarmSchema } from '../farms/schemas/farm.schema';
import { Crop, CropSchema } from '../crops/schemas/crop.schema';
import { Activity, ActivitySchema } from '../activities/schemas/activity.schema';
import { Procurement, ProcurementSchema } from '../procurement/schemas/procurement.schema';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Farmer.name, schema: FarmerSchema },
      { name: Farm.name, schema: FarmSchema },
      { name: Crop.name, schema: CropSchema },
      { name: Activity.name, schema: ActivitySchema },
      { name: Procurement.name, schema: ProcurementSchema },
    ]),
  ],
  providers: [ReportsService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}
