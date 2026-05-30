import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import {
  AcceptGrnDto,
  ListInventoryQueryDto,
  ProcessInventoryDto,
  SellInventoryDto,
  TransferInventoryDto,
  TransitionInventoryDto,
} from './dto/inventory.dto';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';

@ApiTags('inventory')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get()
  list(@Query() query: ListInventoryQueryDto) {
    return this.service.list(query);
  }

  @Get('stats')
  stats() {
    return this.service.stats();
  }

  @Get('batch/:batchId')
  byBatchId(@Param('batchId') batchId: string) {
    return this.service.findByBatchId(batchId);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post('grn/accept')
  acceptGrn(@Body() dto: AcceptGrnDto, @CurrentUser() user: CurrentUserPayload) {
    return this.service.acceptGrn(dto, user.userId);
  }

  @Post(':id/transition')
  transition(
    @Param('id') id: string,
    @Body() dto: TransitionInventoryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.service.transition(id, dto, user.userId);
  }

  @Post(':id/process')
  process(
    @Param('id') id: string,
    @Body() dto: ProcessInventoryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.service.process(id, dto, user.userId);
  }

  @Post(':id/sell')
  sell(
    @Param('id') id: string,
    @Body() dto: SellInventoryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.service.sell(id, dto, user.userId);
  }

  @Post(':id/transfer')
  transfer(
    @Param('id') id: string,
    @Body() dto: TransferInventoryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.service.transfer(id, dto, user.userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.softDelete(id);
  }
}
