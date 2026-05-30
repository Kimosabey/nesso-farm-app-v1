import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

const SAMPLE_STATUSES = ['Queue', 'Sent', 'Received', 'Tested', 'Approved', 'Rejected'] as const;

export class CreateSampleDto {
  @IsString() farmerId!: string;
  @IsOptional() @IsString() @MaxLength(120) farmerName?: string;
  @IsOptional() @IsString() @MaxLength(120) association?: string;
  @IsString() @MaxLength(80) crop!: string;
  @IsString() @MaxLength(80) variety!: string;
  @IsOptional() @IsIn(['Kharif', 'Rabi', 'Summer', 'Perennial', 'Anytime', 'All']) season?: string;
  @IsOptional() @IsString() @MaxLength(1000) notes?: string;
}

export class TransitionSampleDto {
  @IsIn(SAMPLE_STATUSES as unknown as string[]) status!: (typeof SAMPLE_STATUSES)[number];
  @IsOptional() @IsObject() result?: Record<string, unknown>;
  @IsOptional() @IsString() @MaxLength(1000) notes?: string;
}

export class ListSamplesQueryDto {
  @IsOptional() @IsIn(SAMPLE_STATUSES as unknown as string[]) status?: string;
  @IsOptional() @IsString() crop?: string;
  @IsOptional() @IsString() variety?: string;
  @IsOptional() @IsString() association?: string;
  @IsOptional() @IsString() farmerId?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) pageSize?: number;
}
