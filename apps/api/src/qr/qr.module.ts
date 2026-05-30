import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QrCode, QrCodeSchema } from './schemas/qr-code.schema';
import { Inventory, InventorySchema } from '../inventory/schemas/inventory.schema';
import { Procurement, ProcurementSchema } from '../procurement/schemas/procurement.schema';
import { Farmer, FarmerSchema } from '../farmers/schemas/farmer.schema';
import { Farm, FarmSchema } from '../farms/schemas/farm.schema';
import { Crop, CropSchema } from '../crops/schemas/crop.schema';
import { QrService } from './qr.service';
import { QrController } from './qr.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QrCode.name, schema: QrCodeSchema },
      { name: Inventory.name, schema: InventorySchema },
      { name: Procurement.name, schema: ProcurementSchema },
      { name: Farmer.name, schema: FarmerSchema },
      { name: Farm.name, schema: FarmSchema },
      { name: Crop.name, schema: CropSchema },
    ]),
  ],
  providers: [QrService],
  controllers: [QrController],
  exports: [QrService],
})
export class QrModule {}
