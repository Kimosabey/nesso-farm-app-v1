import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WeatherService } from './weather.service';

@ApiTags('weather')
@ApiBearerAuth()
@Controller('weather')
export class WeatherController {
  constructor(private readonly weather: WeatherService) {}

  @Get('farm/:farmId')
  byFarm(@Param('farmId') farmId: string) {
    return this.weather.byFarmId(farmId);
  }

  @Get()
  byCoords(@Query('lat') lat: string, @Query('lng') lng: string) {
    return this.weather.byCoords(Number(lat), Number(lng));
  }
}
