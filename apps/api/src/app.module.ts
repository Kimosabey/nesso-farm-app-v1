import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { CounterModule } from './common/counter/counter.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { FarmersModule } from './farmers/farmers.module';
import { FarmsModule } from './farms/farms.module';
import { CropsModule } from './crops/crops.module';
import { ActivitiesModule } from './activities/activities.module';
import { CatalogModule } from './catalog/catalog.module';
import { SamplesModule } from './samples/samples.module';
import { AuditsModule } from './audits/audits.module';
import { ProcurementModule } from './procurement/procurement.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { QrModule } from './qr/qr.module';
import { InventoryModule } from './inventory/inventory.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { WeatherModule } from './weather/weather.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env.local', '.env'],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
        redact: [
          'req.headers.authorization',
          'req.headers.cookie',
          '*.password',
          '*.otp',
          '*.passwordHash',
          '*.refreshToken',
          '*.accessToken',
        ],
      },
    }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 60_000, limit: 60 },
    ]),
    DatabaseModule,
    CounterModule,
    UsersModule,
    AuthModule,
    FilesModule,
    FarmersModule,
    FarmsModule,
    CropsModule,
    ActivitiesModule,
    CatalogModule,
    SamplesModule,
    AuditsModule,
    ProcurementModule,
    WarehousesModule,
    QrModule,
    InventoryModule,
    NotificationsModule,
    ReportsModule,
    WeatherModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
