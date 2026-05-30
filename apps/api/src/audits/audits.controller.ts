import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuditsService } from './audits.service';
import { CreateAuditDto, ListAuditsQueryDto, ReviewAuditDto } from './dto/audit.dto';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';

@ApiTags('audits')
@ApiBearerAuth()
@Controller('audits')
export class AuditsController {
  constructor(private readonly audits: AuditsService) {}

  @Get()
  list(@Query() query: ListAuditsQueryDto) {
    return this.audits.list(query);
  }

  @Get('stats')
  stats() {
    return this.audits.stats();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.audits.findById(id);
  }

  @Post()
  create(@Body() dto: CreateAuditDto, @CurrentUser() user: CurrentUserPayload) {
    return this.audits.create(dto, user.userId);
  }

  @Post(':id/review')
  review(
    @Param('id') id: string,
    @Body() dto: ReviewAuditDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.audits.review(id, dto, user.userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.audits.softDelete(id);
  }
}
