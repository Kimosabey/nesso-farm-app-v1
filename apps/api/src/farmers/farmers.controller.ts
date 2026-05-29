import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FarmersService } from './farmers.service';
import {
  ApproveFarmerDto,
  CreateFarmerDto,
  ListFarmersQueryDto,
  UpdateFarmerDto,
} from './dto/farmer.dto';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';

@ApiTags('farmers')
@ApiBearerAuth()
@Controller('farmers')
export class FarmersController {
  constructor(private readonly farmers: FarmersService) {}

  @Get()
  list(@Query() query: ListFarmersQueryDto) {
    return this.farmers.list(query);
  }

  @Get('stats')
  stats() {
    return this.farmers.countByStatus();
  }

  @Get('pending')
  pending(@Query() query: ListFarmersQueryDto) {
    return this.farmers.list({ ...query, approvalStatus: 'pending' });
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.farmers.findById(id);
  }

  @Post()
  create(@Body() dto: CreateFarmerDto, @CurrentUser() user: CurrentUserPayload) {
    return this.farmers.create(dto, user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFarmerDto) {
    return this.farmers.update(id, dto);
  }

  @Post(':id/approve')
  approve(
    @Param('id') id: string,
    @Body() dto: ApproveFarmerDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.farmers.approve(id, dto, user.userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.farmers.softDelete(id);
  }
}
