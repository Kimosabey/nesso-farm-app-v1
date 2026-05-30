import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateAuditDto {
  @IsString() farmerId!: string;
  @IsOptional() @IsString() @MaxLength(120) farmerName?: string;
  @IsOptional() @IsString() @MaxLength(120) association?: string;
  @IsIn(['Internal', 'External', 'Compliance']) auditType!: 'Internal' | 'External' | 'Compliance';
  @IsString() @MinLength(3) @MaxLength(2000) description!: string;
  @IsOptional() @IsString() @MaxLength(2000) remarks?: string;
  @IsDateString() auditDate!: string;
  @IsOptional() @IsArray() @ArrayMaxSize(20) @IsString({ each: true }) attachments?: string[];
}

export class ReviewAuditDto {
  @IsBoolean() approved!: boolean;
  @IsOptional() @IsString() @MinLength(3) @MaxLength(500) reason?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(5) @IsString({ each: true }) tags?: string[];
}

export class ListAuditsQueryDto {
  @IsOptional() @IsIn(['Pending', 'Approved', 'Rejected']) status?: string;
  @IsOptional() @IsIn(['Internal', 'External', 'Compliance']) auditType?: string;
  @IsOptional() @IsString() association?: string;
  @IsOptional() @IsString() farmerId?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) pageSize?: number;
}
