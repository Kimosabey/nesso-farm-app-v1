import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

const MOBILE_RE = /^[6-9]\d{9}$/;
const PIN_RE = /^\d{6}$/;
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;

class AddressDto {
  @IsOptional() @IsString() @MaxLength(60) state?: string;
  @IsOptional() @IsString() @MaxLength(60) district?: string;
  @IsOptional() @IsString() @MaxLength(60) taluka?: string;
  @IsOptional() @IsString() @MaxLength(60) hobli?: string;
  @IsOptional() @IsString() @MaxLength(60) city?: string;
  @IsOptional() @IsString() @MaxLength(60) village?: string;
  @IsOptional() @IsString() @MaxLength(60) town?: string;
  @IsOptional() @Matches(PIN_RE, { message: 'Pincode must be 6 digits' }) pincode?: string;
  @IsOptional() @IsString() @MaxLength(200) line1?: string;
}

class IdProofDto {
  @IsOptional()
  @IsIn(['Aadhaar', 'Voter', 'PAN', 'Passport', 'DL', 'Ration', 'MNREGA', 'NationalID'])
  type?: string;
  @IsOptional() @IsString() @MaxLength(40) number?: string;
  @IsOptional() @IsString() imageKey?: string;
}

class BankDto {
  @IsOptional() @IsString() @MinLength(9) @MaxLength(18) accountNumber?: string;
  @IsOptional() @Matches(IFSC_RE, { message: 'IFSC must be ABCD0123456' }) ifsc?: string;
  @IsOptional() @IsString() @MaxLength(120) bankName?: string;
  @IsOptional() @IsString() @MaxLength(120) branchName?: string;
  @IsOptional() @IsString() passbookImageKey?: string;
}

export class CreateFarmerDto {
  @IsString() @MinLength(1) @MaxLength(80) firstName!: string;
  @IsOptional() @IsString() @MaxLength(80) lastName?: string;
  @Matches(MOBILE_RE, { message: 'Enter a valid 10-digit mobile number' }) mobileNumber!: string;
  @IsOptional() @IsIn(['M', 'F', 'Other']) gender?: 'M' | 'F' | 'Other';
  @IsOptional() @IsDateString() dob?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional()
  @IsIn(['INDEPENDENT', 'FLOWER_AGENT', 'FPO'])
  groupAssociation?: 'INDEPENDENT' | 'FLOWER_AGENT' | 'FPO';
  @IsOptional() @IsBoolean() isFlowerAgent?: boolean;
  @IsOptional() @ValidateNested() @Type(() => AddressDto) address?: AddressDto;
  @IsOptional() @ValidateNested() @Type(() => IdProofDto) idProof?: IdProofDto;
  @IsOptional() @ValidateNested() @Type(() => BankDto) bank?: BankDto;
  @IsOptional() @IsString() profileImageKey?: string;
  @IsOptional() @IsInt() @Min(0) totalLandHolding?: number;
  @IsOptional() selectedCrops?: string[];
  @IsOptional()
  @IsIn(['Organic', 'Conventional', 'NaturalFarming', 'GAPCertified'])
  productionPractice?: string;
  @IsOptional() @IsString() variety?: string;
  @IsOptional() @IsString() preferredLanguage?: string;
  @IsOptional() @IsString() fpoId?: string;
  @IsOptional() @IsString() flowerAgentId?: string;
  @IsOptional() @IsBoolean() publicTraceConsent?: boolean;
}

export class UpdateFarmerDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(80) firstName?: string;
  @IsOptional() @IsString() @MaxLength(80) lastName?: string;
  @IsOptional() @Matches(MOBILE_RE) mobileNumber?: string;
  @IsOptional() @IsIn(['M', 'F', 'Other']) gender?: 'M' | 'F' | 'Other';
  @IsOptional() @IsDateString() dob?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional()
  @IsIn(['INDEPENDENT', 'FLOWER_AGENT', 'FPO'])
  groupAssociation?: 'INDEPENDENT' | 'FLOWER_AGENT' | 'FPO';
  @IsOptional() @IsBoolean() isFlowerAgent?: boolean;
  @IsOptional() @ValidateNested() @Type(() => AddressDto) address?: AddressDto;
  @IsOptional() @ValidateNested() @Type(() => IdProofDto) idProof?: IdProofDto;
  @IsOptional() @ValidateNested() @Type(() => BankDto) bank?: BankDto;
  @IsOptional() @IsString() profileImageKey?: string;
  @IsOptional() @IsString() preferredLanguage?: string;
  @IsOptional() @IsBoolean() publicTraceConsent?: boolean;
}

export class ApproveFarmerDto {
  @IsBoolean() approved!: boolean;
  @IsOptional() @IsString() @MaxLength(500) reason?: string;
}

export class ListFarmersQueryDto {
  @IsOptional() @IsIn(['pending', 'approved', 'rejected']) approvalStatus?: string;
  @IsOptional() @IsString() @MaxLength(120) q?: string;
  @IsOptional() @IsString() association?: string;
  @IsOptional() @IsString() district?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) pageSize?: number;
}
