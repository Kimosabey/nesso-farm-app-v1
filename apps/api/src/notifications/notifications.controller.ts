import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import {
  CreateNotificationDto,
  ListNotificationsQueryDto,
  RegisterDeviceDto,
} from './dto/notification.dto';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifs: NotificationsService) {}

  @Get()
  inbox(@CurrentUser() user: CurrentUserPayload, @Query() query: ListNotificationsQueryDto) {
    return this.notifs.listForUser(user.userId, query);
  }

  @Post()
  create(@Body() dto: CreateNotificationDto) {
    return this.notifs.create(dto);
  }

  @Patch(':id/read')
  read(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.notifs.markRead(user.userId, id);
  }

  @Patch('read-all')
  readAll(@CurrentUser() user: CurrentUserPayload) {
    return this.notifs.markAllRead(user.userId);
  }

  @Post('register-device')
  registerDevice(@CurrentUser() user: CurrentUserPayload, @Body() dto: RegisterDeviceDto) {
    return this.notifs.registerDevice(user.userId, dto);
  }

  @Delete('devices/:tokenHash')
  unregisterDevice(
    @Param('tokenHash') tokenHash: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.notifs.unregisterDevice(user.userId, tokenHash);
  }
}
