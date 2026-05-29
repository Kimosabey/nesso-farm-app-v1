import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';

@ApiTags('catalog')
@ApiBearerAuth()
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('inputs')
  inputs(
    @Query('kind') kind?: string,
    @Query('q') q?: string,
    @Query('limit') limit?: string,
  ) {
    return this.catalog.listInputs({
      kind,
      q,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('pop')
  pop(
    @Query('crop') crop?: string,
    @Query('variety') variety?: string,
    @Query('year') year?: string,
  ) {
    return this.catalog.listPop({
      crop,
      variety,
      year: year ? Number(year) : undefined,
    });
  }

  @Get('pop/:popId')
  popById(@Param('popId') popId: string) {
    return this.catalog.findPopById(popId);
  }
}
