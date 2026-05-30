import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Farmer, FarmerSchema } from './schemas/farmer.schema';
import { Farm, FarmSchema } from '../farms/schemas/farm.schema';
import { Crop, CropSchema } from '../crops/schemas/crop.schema';
import { Activity, ActivitySchema } from '../activities/schemas/activity.schema';
import { Sample, SampleSchema } from '../samples/schemas/sample.schema';
import { Audit, AuditSchema } from '../audits/schemas/audit.schema';
import { FarmersService } from './farmers.service';
import { FarmersController } from './farmers.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Farmer.name, schema: FarmerSchema },
      { name: Farm.name, schema: FarmSchema },
      { name: Crop.name, schema: CropSchema },
      { name: Activity.name, schema: ActivitySchema },
      { name: Sample.name, schema: SampleSchema },
      { name: Audit.name, schema: AuditSchema },
    ]),
    NotificationsModule,
  ],
  providers: [FarmersService],
  controllers: [FarmersController],
  exports: [FarmersService],
})
export class FarmersModule {}
