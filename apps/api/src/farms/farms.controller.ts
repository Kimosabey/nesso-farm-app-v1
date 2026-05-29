import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FarmsService } from './farms.service';
import { CreateFarmDto, ListFarmsQueryDto, NearbyQueryDto } from './dto/farm.dto';

@ApiTags('farms')
@ApiBearerAuth()
@Controller('farms')
export class FarmsController {
  constructor(private readonly farms: FarmsService) {}

  @Get()
  list(@Query() query: ListFarmsQueryDto) {
    return this.farms.list(query);
  }

  @Get('nearby')
  nearby(@Query() query: NearbyQueryDto) {
    return this.farms.nearby(query);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.farms.findById(id);
  }

  @Post()
  create(@Body() dto: CreateFarmDto) {
    return this.farms.create(dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.farms.softDelete(id);
  }
}
