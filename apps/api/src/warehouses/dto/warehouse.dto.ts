import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
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

class WarehouseContactDto {
  @IsOptional() @IsString() @MaxLength(120) name?: string;
  @IsOptional() @IsString() @MaxLength(20) mobileNumber?: string;
  @IsOptional() @IsEmail() email?: string;
}

class WarehouseAddressDto {
  @IsOptional() @IsString() @MaxLength(60) country?: string;
  @IsOptional() @IsString() @MaxLength(60) state?: string;
  @IsOptional() @IsString() @MaxLength(60) district?: string;
  @IsOptional() @IsString() @MaxLength(60) taluka?: string;
  @IsOptional() @IsString() @MaxLength(60) hobli?: string;
  @IsOptional() @IsString() @MaxLength(60) city?: string;
  @IsOptional() @IsString() @MaxLength(10) pincode?: string;
  @IsOptional() @IsString() @MaxLength(200) line1?: string;
}

export class CreateWarehouseDto {
  @IsString() @MaxLength(120) warehouseName!: string;
  @IsOptional() @IsIn(['Storage', 'FoodProcessing']) type?: 'Storage' | 'FoodProcessing';
  @IsOptional() @IsString() @MaxLength(200) availableFacility?: string;
  @IsOptional() @ValidateNested() @Type(() => WarehouseContactDto) primaryContact?: WarehouseContactDto;
  @IsOptional() @IsDateString() incorporationDate?: string;
  @IsOptional() @IsIn(['Own', 'Leased']) ownership?: 'Own' | 'Leased';
  @IsOptional() @IsNumber() @Min(0) capacity?: number;
  @IsOptional() @IsNumber() @Min(0) totalArea?: number;
  @IsOptional() @IsIn(['Applied', 'Conventional', 'Certified']) certificationStatus?: string;
  @IsOptional() @IsString() certifyingAgency?: string;
  @IsOptional() @ValidateNested() @Type(() => WarehouseAddressDto) address?: WarehouseAddressDto;
  @IsOptional() @IsLatitude() latitude?: number;
  @IsOptional() @IsLongitude() longitude?: number;
}

export class ListWarehousesQueryDto {
  @IsOptional() @IsIn(['Storage', 'FoodProcessing']) type?: string;
  @IsOptional() @IsString() certificationStatus?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) pageSize?: number;
}
