import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('pre-harvest')
  preHarvest(
    @Query('approvalStatus') approvalStatus?: string,
    @Query('includeFlowerAgents') includeFlowerAgents?: string,
    @Query('includeMissingFarm') includeMissingFarm?: string,
  ) {
    return this.reports.preHarvest({
      approvalStatus,
      includeFlowerAgents: includeFlowerAgents !== 'false',
      includeMissingFarm: includeMissingFarm === 'true',
    });
  }

  @Get('farmer-summary')
  farmerSummary(
    @Query('farmerId') farmerId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reports.farmerSummary({ farmerId, from, to });
  }
}
