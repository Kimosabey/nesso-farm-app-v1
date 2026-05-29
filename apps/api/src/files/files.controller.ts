import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common';
import { IsIn, IsString } from 'class-validator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FilesService } from './files.service';

class SignUploadDto {
  @IsString()
  @IsIn([
    'profile',
    'id-proof',
    'bank-passbook',
    'farm-map',
    'farm-photo',
    'activity-photo',
    'audit-attachment',
  ])
  kind!: string;

  @IsString()
  @IsIn(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'])
  contentType!: string;
}

@ApiTags('files')
@ApiBearerAuth()
@Controller('files')
export class FilesController {
  constructor(private readonly files: FilesService) {}

  @Post('sign-upload')
  signUpload(@Body() dto: SignUploadDto) {
    return this.files.signUpload(dto);
  }

  @Get('sign-read')
  signRead(@Query('key') key?: string) {
    if (!key || key.length < 1 || key.length > 500) {
      throw new BadRequestException('key must be 1–500 chars');
    }
    return this.files.signRead(key);
  }
}
