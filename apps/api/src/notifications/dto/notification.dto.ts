import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateNotificationDto {
  @IsString() userId!: string;
  @IsIn(['weather', 'activityReminder', 'approval', 'sync', 'system'])
  kind!: 'weather' | 'activityReminder' | 'approval' | 'sync' | 'system';
  @IsString() @MaxLength(120) title!: string;
  @IsString() @MaxLength(500) body!: string;
  @IsOptional() @IsObject() data?: Record<string, unknown>;
  @IsOptional() @IsIn(['push', 'inApp', 'sms']) channel?: 'push' | 'inApp' | 'sms';
}

export class RegisterDeviceDto {
  @IsString() @MinLength(10) expoPushToken!: string;
  @IsIn(['ios', 'android', 'web']) platform!: 'ios' | 'android' | 'web';
  @IsOptional() @IsString() appVersion?: string;
  @IsOptional() @IsString() osVersion?: string;
}

export class ListNotificationsQueryDto {
  @IsOptional() @IsIn(['queued', 'sent', 'delivered', 'read', 'failed']) status?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) pageSize?: number;
}
