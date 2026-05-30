import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProcurementService } from './procurement.service';
import {
  CreateProcurementDto,
  ListProcurementQueryDto,
  RecordPaymentDto,
  TransitionProcurementDto,
} from './dto/procurement.dto';

@ApiTags('procurement')
@ApiBearerAuth()
@Controller('procurement')
export class ProcurementController {
  constructor(private readonly service: ProcurementService) {}

  @Get()
  list(@Query() query: ListProcurementQueryDto) {
    return this.service.list(query);
  }

  @Get('stats')
  stats() {
    return this.service.stats();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() dto: CreateProcurementDto) {
    return this.service.create(dto);
  }

  @Post(':id/payment')
  payment(@Param('id') id: string, @Body() dto: RecordPaymentDto) {
    return this.service.recordPayment(id, dto);
  }

  @Post(':id/transition')
  transition(@Param('id') id: string, @Body() dto: TransitionProcurementDto) {
    return this.service.transition(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.softDelete(id);
  }
}
