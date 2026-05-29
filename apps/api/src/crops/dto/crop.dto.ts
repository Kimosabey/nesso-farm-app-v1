import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCropDto {
  @IsString() farmId!: string;
  @IsString() farmerId!: string;
  @IsString() @MaxLength(80) cropName!: string;
  @IsOptional() @IsString() @MaxLength(80) cropVariety?: string;
  @IsOptional() @IsIn(['Main', 'Inter', 'Border']) cropType?: 'Main' | 'Inter' | 'Border';
  @IsOptional() @IsIn(['kg', 'quintal', 'tonne', 'nos']) unit?: string;
  @IsOptional() @IsNumber() @Min(0) acre?: number;
  @IsOptional() @IsNumber() @Min(0) mappedAcre?: number;
  @IsOptional() @IsNumber() @Min(0) estHarvest?: number;
  @IsOptional() @IsIn(['RAINFED', 'IRRIGATION']) waterType?: string;
  @IsOptional() @IsIn(['SOWING', 'PLANTING']) method?: string;
  @IsOptional() @IsIn(['CONVENTIONAL', 'ORGANIC']) practice?: string;
  @IsOptional() @IsDateString() sowingDate?: string;
  @IsOptional() @IsDateString() harvestDate?: string;
  @IsOptional() @IsBoolean() multipleHarvest?: boolean;
  @IsOptional() @IsIn(['Kharif', 'Rabi', 'Summer', 'Perennial', 'Anytime', 'All']) season?: string;
  @IsOptional() @Type(() => Number) @IsInt() year?: number;
}

export class ListCropsQueryDto {
  @IsOptional() @IsString() farmId?: string;
  @IsOptional() @IsString() farmerId?: string;
  @IsOptional() @IsString() season?: string;
  @IsOptional() @Type(() => Number) @IsInt() year?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) pageSize?: number;
}
