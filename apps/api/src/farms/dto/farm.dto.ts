import { Type } from 'class-transformer';
import {
  IsArray,
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

class PolygonPointDto {
  @IsLatitude() lat!: number;
  @IsLongitude() lng!: number;
}

class FarmAddressDto {
  @IsOptional() @IsString() @MaxLength(60) state?: string;
  @IsOptional() @IsString() @MaxLength(60) district?: string;
  @IsOptional() @IsString() @MaxLength(60) taluka?: string;
  @IsOptional() @IsString() @MaxLength(60) hobli?: string;
  @IsOptional() @IsString() @MaxLength(60) city?: string;
  @IsOptional() @IsString() @MaxLength(10) pincode?: string;
}

export class CreateFarmDto {
  @IsString() farmerId!: string;
  @IsString() @MaxLength(120) farmName!: string;
  @IsOptional() @IsString() @MaxLength(60) surveyNumber?: string;
  @IsNumber() @Min(0) farmArea!: number;
  @IsOptional() @IsNumber() @Min(0) growingArea?: number;
  @IsOptional() @IsIn(['Certified', 'InTransition', 'Conventional']) organicStage?: string;
  @IsOptional() @IsString() previousPractice?: string;
  @IsOptional() @IsString() waterSource?: string;
  @IsOptional() @IsString() soilType?: string;
  @IsOptional() @IsIn(['Own', 'Lease', 'Share']) ownership?: string;
  @IsOptional() @IsIn(['Open', 'Greenhouse', 'ShadeNet']) fieldType?: string;
  @IsLatitude() latitude!: number;
  @IsLongitude() longitude!: number;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PolygonPointDto)
  polygonPoints?: PolygonPointDto[];
  @IsOptional() @IsString() mapScreenshotKey?: string;
  @IsOptional() @ValidateNested() @Type(() => FarmAddressDto) address?: FarmAddressDto;
}

export class ListFarmsQueryDto {
  @IsOptional() @IsString() farmerId?: string;
  @IsOptional() @IsString() flowerAgentId?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) pageSize?: number;
}

export class NearbyQueryDto {
  @Type(() => Number) @IsLatitude() lat!: number;
  @Type(() => Number) @IsLongitude() lng!: number;
  @Type(() => Number) @IsNumber() @Min(0.01) radiusKm!: number;
}
