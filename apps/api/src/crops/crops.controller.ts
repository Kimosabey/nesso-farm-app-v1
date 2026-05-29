import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CropsService } from './crops.service';
import { CreateCropDto, ListCropsQueryDto } from './dto/crop.dto';

@ApiTags('crops')
@ApiBearerAuth()
@Controller('crops')
export class CropsController {
  constructor(private readonly crops: CropsService) {}

  @Get()
  list(@Query() query: ListCropsQueryDto) {
    return this.crops.list(query);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.crops.findById(id);
  }

  @Post()
  create(@Body() dto: CreateCropDto) {
    return this.crops.create(dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.crops.softDelete(id);
  }
}
