import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Sample, SampleSchema } from './schemas/sample.schema';
import { SamplesService } from './samples.service';
import { SamplesController } from './samples.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Sample.name, schema: SampleSchema }])],
  providers: [SamplesService],
  controllers: [SamplesController],
  exports: [SamplesService],
})
export class SamplesModule {}
