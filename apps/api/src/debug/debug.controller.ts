import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import * as Sentry from '@sentry/nestjs';
import { Public } from '../common/decorators/public.decorator';

/**
 * Test-only routes for verifying observability wiring.
 *
 * Remove (or guard behind NODE_ENV !== 'production') before shipping.
 */
@ApiTags('debug')
@Controller('debug')
export class DebugController {
  @Public()
  @Get('sentry/throw')
  throwSync(): never {
    throw new InternalServerErrorException(
      `Sentry test (sync) — fired at ${new Date().toISOString()}`,
    );
  }

  @Public()
  @Get('sentry/async')
  async throwAsync(): Promise<never> {
    await new Promise((r) => setTimeout(r, 10));
    throw new Error(`Sentry test (async) — fired at ${new Date().toISOString()}`);
  }

  @Public()
  @Get('sentry/message')
  captureMessage(): { ok: true; eventId: string | undefined } {
    const eventId = Sentry.captureMessage(
      `Sentry test (message) — fired at ${new Date().toISOString()}`,
      'info',
    );
    return { ok: true, eventId };
  }
}
