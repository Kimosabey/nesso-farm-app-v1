import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InputCatalog, InputCatalogSchema } from './schemas/input-catalog.schema';
import { PopCatalog, PopCatalogSchema } from './schemas/pop-catalog.schema';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InputCatalog.name, schema: InputCatalogSchema },
      { name: PopCatalog.name, schema: PopCatalogSchema },
    ]),
  ],
  providers: [CatalogService],
  controllers: [CatalogController],
  exports: [CatalogService],
})
export class CatalogModule {}
