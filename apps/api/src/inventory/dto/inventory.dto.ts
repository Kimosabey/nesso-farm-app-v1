import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class AcceptGrnDto {
  @IsString() procurementId!: string;
  @IsString() warehouseId!: string;
  @IsNumber() @Min(0.001) quantity!: number;
  @IsOptional() @IsString() @MaxLength(40) grade?: string;
  @IsOptional() @IsIn(['kg', 'quintal', 'tonne', 'nos']) unit?: string;
  @IsOptional() @IsDateString() expiryDate?: string;
  @IsOptional() @IsIn(['RawMaterial', 'SemiProcessed', 'FinishedGood']) type?: string;
}

export class TransitionInventoryDto {
  @IsIn(['AVAILABLE', 'PROCESSING', 'SOLD', 'TRANSFERRED'])
  toStatus!: 'AVAILABLE' | 'PROCESSING' | 'SOLD' | 'TRANSFERRED';
  @IsOptional() @IsString() @MaxLength(80) toStage?: string;
  @IsOptional() @IsString() @MaxLength(1000) notes?: string;
}

export class SellInventoryDto {
  @IsNumber() @Min(0.001) quantity!: number;
  @IsString() buyer!: string;
  @IsOptional() @IsString() @MaxLength(1000) notes?: string;
}

export class TransferInventoryDto {
  @IsString() toWarehouseId!: string;
  @IsNumber() @Min(0.001) quantity!: number;
  @IsOptional() @IsString() @MaxLength(1000) notes?: string;
}

export class ProcessInventoryDto {
  @IsString() @MaxLength(80) toStage!: string;
  @IsOptional() @IsString() @MaxLength(1000) notes?: string;
}

export class ListInventoryQueryDto {
  @IsOptional() @IsIn(['AVAILABLE', 'PROCESSING', 'SOLD', 'TRANSFERRED']) status?: string;
  @IsOptional() @IsString() warehouseId?: string;
  @IsOptional() @IsString() grade?: string;
  @IsOptional() @IsString() supplier?: string;
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) pageSize?: number;
}
