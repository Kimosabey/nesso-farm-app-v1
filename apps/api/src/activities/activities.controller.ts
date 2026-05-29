import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import {
  CreateActivityDto,
  ListActivitiesQueryDto,
  SyncActivitiesDto,
} from './dto/activity.dto';

@ApiTags('activities')
@ApiBearerAuth()
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activities: ActivitiesService) {}

  @Get()
  list(@Query() query: ListActivitiesQueryDto) {
    return this.activities.list(query);
  }

  @Get('stats')
  stats() {
    return this.activities.stats();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.activities.findById(id);
  }

  @Post()
  create(@Body() dto: CreateActivityDto) {
    return this.activities.create(dto);
  }

  /**
   * Batch upsert from the mobile outbox.
   * Idempotent: dup clientRequestId rows are counted but not re-created.
   */
  @Post('sync')
  sync(@Body() dto: SyncActivitiesDto) {
    return this.activities.syncMany(dto.records);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.activities.softDelete(id);
  }
}
