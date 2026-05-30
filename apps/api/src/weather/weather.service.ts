import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Farm, FarmDocument } from '../farms/schemas/farm.schema';

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

// Cached in-memory for 1 hour (Phase 6 moves to Redis)
const cache = new Map<string, { at: number; value: WeatherSnapshot }>();
const TTL_MS = 60 * 60 * 1000;

export interface WeatherSnapshot {
  fetchedAt: string;
  location: { latitude: number; longitude: number; sourceFarmId?: string };
  current: {
    tempC: number;
    feelsLikeC?: number;
    humidity?: number;
    windKmh?: number;
    code?: number;
    description?: string;
  };
  daily: Array<{
    date: string;
    minC: number;
    maxC: number;
    precipMm?: number;
    precipProbability?: number;
    code?: number;
    description?: string;
  }>;
  advisories: string[];
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(@InjectModel(Farm.name) private readonly farmModel: Model<FarmDocument>) {}

  async byCoords(lat: number, lng: number): Promise<WeatherSnapshot> {
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new BadRequestException('Invalid coordinates');
    }
    return this.fetch(lat, lng);
  }

  async byFarmId(farmId: string): Promise<WeatherSnapshot> {
    const farm = await this.farmModel.findOne({ _id: farmId, isDeleted: false }).lean().exec();
    if (!farm) throw new NotFoundException('Farm not found');
    const [lng, lat] = farm.location?.coordinates ?? [];
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new BadRequestException('Farm has no GPS location set');
    }
    const snapshot = await this.fetch(lat, lng);
    return { ...snapshot, location: { ...snapshot.location, sourceFarmId: farm.farmId } };
  }

  private async fetch(lat: number, lng: number): Promise<WeatherSnapshot> {
    const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    const cached = cache.get(key);
    if (cached && Date.now() - cached.at < TTL_MS) {
      return cached.value;
    }

    const url =
      `${OPEN_METEO_BASE}?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code` +
      `&timezone=auto&forecast_days=7`;

    let res: Response;
    try {
      res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    } catch (e) {
      this.logger.warn(`Open-Meteo fetch failed: ${(e as Error).message}`);
      throw new InternalServerErrorException('Weather service unavailable');
    }
    if (!res.ok) {
      throw new InternalServerErrorException(`Open-Meteo returned ${res.status}`);
    }
    const data = (await res.json()) as OpenMeteoResponse;

    const daily = (data.daily?.time ?? []).map((iso, i) => ({
      date: iso,
      minC: data.daily!.temperature_2m_min[i],
      maxC: data.daily!.temperature_2m_max[i],
      precipMm: data.daily?.precipitation_sum?.[i],
      precipProbability: data.daily?.precipitation_probability_max?.[i],
      code: data.daily?.weather_code?.[i],
      description: describeCode(data.daily?.weather_code?.[i]),
    }));

    const advisories: string[] = [];
    const tomorrow = daily[1];
    if (tomorrow?.precipMm && tomorrow.precipMm >= 10) {
      advisories.push(
        `Heavy rain expected tomorrow (${tomorrow.precipMm.toFixed(1)}mm) — postpone spraying.`,
      );
    }
    const next3DaysDry = daily
      .slice(0, 3)
      .every((d) => (d.precipMm ?? 0) < 1 && (d.precipProbability ?? 0) < 30);
    if (next3DaysDry) {
      advisories.push('Dry window over the next 3 days — good time for fertilizer or harvest.');
    }
    const frosting = daily
      .slice(0, 2)
      .some((d) => d.minC <= 4);
    if (frosting) advisories.push('Low overnight temps incoming — risk of frost on sensitive crops.');

    const snapshot: WeatherSnapshot = {
      fetchedAt: new Date().toISOString(),
      location: { latitude: lat, longitude: lng },
      current: {
        tempC: data.current?.temperature_2m ?? NaN,
        feelsLikeC: data.current?.apparent_temperature,
        humidity: data.current?.relative_humidity_2m,
        windKmh: data.current?.wind_speed_10m,
        code: data.current?.weather_code,
        description: describeCode(data.current?.weather_code),
      },
      daily,
      advisories,
    };

    cache.set(key, { at: Date.now(), value: snapshot });
    return snapshot;
  }
}

interface OpenMeteoResponse {
  current?: {
    temperature_2m?: number;
    relative_humidity_2m?: number;
    apparent_temperature?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum?: number[];
    precipitation_probability_max?: number[];
    weather_code?: number[];
  };
}

function describeCode(code?: number): string | undefined {
  if (code === undefined) return undefined;
  // WMO weather interpretation codes — abbreviated
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 67) return 'Rainy';
  if (code <= 77) return 'Snowy';
  if (code <= 82) return 'Showers';
  if (code <= 99) return 'Thunderstorm';
  return undefined;
}
