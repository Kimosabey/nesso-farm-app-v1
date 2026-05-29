import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Crop, CropSchema } from './schemas/crop.schema';
import { CropsService } from './crops.service';
import { CropsController } from './crops.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Crop.name, schema: CropSchema }])],
  providers: [CropsService],
  controllers: [CropsController],
  exports: [CropsService],
})
export class CropsModule {}
