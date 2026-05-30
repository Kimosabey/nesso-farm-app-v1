import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { Throttle } from '@nestjs/throttler';
import { QrService } from './qr.service';
import { Public } from '../common/decorators/public.decorator';

class GenerateQrDto {
  @IsString() @MinLength(1) batchId!: string;
}

@ApiTags('qr')
@Controller()
export class QrController {
  constructor(private readonly qr: QrService) {}

  @ApiBearerAuth()
  @Post('qr/generate')
  generate(@Body() dto: GenerateQrDto) {
    return this.qr.generateForBatch(dto.batchId);
  }

  @ApiBearerAuth()
  @Get('qr/batch/:batchId')
  byBatchId(@Param('batchId') batchId: string) {
    return this.qr.findByBatchId(batchId);
  }

  @Public()
  @Get('public/trace/:code')
  @Throttle({ short: { ttl: 60_000, limit: 60 } })
  async publicTrace(@Param('code') code: string) {
    const doc = await this.qr.findByCode(code);
    // Async, fire-and-forget scan log
    void this.qr.logScan(code);
    return {
      code: doc.code,
      ...doc.payload,
      scanCount: doc.scanCount + 1,
    };
  }
}
