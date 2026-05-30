import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SamplesService } from './samples.service';
import {
  CreateSampleDto,
  ListSamplesQueryDto,
  TransitionSampleDto,
} from './dto/sample.dto';

@ApiTags('samples')
@ApiBearerAuth()
@Controller('samples')
export class SamplesController {
  constructor(private readonly samples: SamplesService) {}

  @Get()
  list(@Query() query: ListSamplesQueryDto) {
    return this.samples.list(query);
  }

  @Get('stats')
  stats() {
    return this.samples.stats();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.samples.findById(id);
  }

  @Post()
  create(@Body() dto: CreateSampleDto) {
    return this.samples.create(dto);
  }

  @Post(':id/transition')
  transition(@Param('id') id: string, @Body() dto: TransitionSampleDto) {
    return this.samples.transition(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.samples.softDelete(id);
  }
}
