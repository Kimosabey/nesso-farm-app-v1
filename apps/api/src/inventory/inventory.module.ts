import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Inventory, InventorySchema } from './schemas/inventory.schema';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { ProcurementModule } from '../procurement/procurement.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { QrModule } from '../qr/qr.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Inventory.name, schema: InventorySchema }]),
    ProcurementModule,
    WarehousesModule,
    QrModule,
  ],
  providers: [InventoryService],
  controllers: [InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}
