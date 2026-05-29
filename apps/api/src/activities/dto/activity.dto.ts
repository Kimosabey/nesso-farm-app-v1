import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

class ActivityInputDto {
  @IsIn(['Chemical', 'Organic', 'Inventory', 'Other'])
  kind!: 'Chemical' | 'Organic' | 'Inventory' | 'Other';
  @IsOptional() @IsString() itemId?: string;
  @IsString() @MaxLength(120) name!: string;
  @IsNumber() @Min(0) quantity!: number;
  @IsOptional() @IsString() @MaxLength(20) unit?: string;
  @IsOptional() @IsNumber() @Min(0) cost?: number;
}

class GeoTagDto {
  @IsLatitude() lat!: number;
  @IsLongitude() lng!: number;
  @IsOptional() @IsNumber() accuracy?: number;
}

export class CreateActivityDto {
  @IsString() farmId!: string;
  @IsString() farmerId!: string;
  @IsOptional() @IsString() cropId?: string;
  @IsString() @MaxLength(120) activity!: string;
  @IsOptional() @IsString() @MaxLength(20) cropAge?: string;
  @IsOptional() @IsDateString() scheduledOn?: string;
  @IsOptional() @IsDateString() completedDate?: string;
  @IsOptional()
  @IsIn(['Pending', 'Completed', 'Overdue', 'Cancelled'])
  status?: 'Pending' | 'Completed' | 'Overdue' | 'Cancelled';
  @IsOptional() @IsString() popCompliance?: string;
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => ActivityInputDto)
  inputs?: ActivityInputDto[];
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(10) photos?: string[];
  @IsOptional() @ValidateNested() @Type(() => GeoTagDto) geoTag?: GeoTagDto;
  @IsOptional() @IsString() clientRequestId?: string;
}

export class SyncActivitiesDto {
  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => CreateActivityDto)
  records!: CreateActivityDto[];
}

export class ListActivitiesQueryDto {
  @IsOptional() @IsString() farmId?: string;
  @IsOptional() @IsString() farmerId?: string;
  @IsOptional() @IsString() cropId?: string;
  @IsOptional()
  @IsIn(['Pending', 'Completed', 'Overdue', 'Cancelled'])
  status?: 'Pending' | 'Completed' | 'Overdue' | 'Cancelled';
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) pageSize?: number;
}
