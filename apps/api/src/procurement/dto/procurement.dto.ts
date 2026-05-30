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

export class CreateProcurementDto {
  @IsString() farmerId!: string;
  @IsOptional() @IsString() @MaxLength(120) farmerName?: string;
  @IsOptional() @IsString() @MaxLength(120) association?: string;
  @IsString() @MaxLength(80) crop!: string;
  @IsOptional() @IsString() @MaxLength(80) variety?: string;
  @IsNumber() @Min(0.001) quantity!: number;
  @IsNumber() @Min(0.01) pricePerUnit!: number;
  @IsOptional() @IsIn(['kg', 'quintal']) unit?: string;
  @IsDateString() procurementDate!: string;
}

export class RecordPaymentDto {
  @IsNumber() @Min(0.01) amount!: number;
  @IsDateString() date!: string;
  @IsOptional() @IsIn(['Cash', 'Bank', 'UPI', 'Other']) method?: string;
  @IsOptional() @IsString() @MaxLength(80) referenceNo?: string;
}

export class TransitionProcurementDto {
  @IsIn(['Pending', 'Completed', 'Cancelled']) status!: 'Pending' | 'Completed' | 'Cancelled';
}

export class ListProcurementQueryDto {
  @IsOptional() @IsIn(['Pending', 'Completed', 'Cancelled']) status?: string;
  @IsOptional() @IsString() association?: string;
  @IsOptional() @IsString() farmerId?: string;
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) pageSize?: number;
}
