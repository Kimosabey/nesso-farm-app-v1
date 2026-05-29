import { IsString, MinLength, MaxLength } from 'class-validator';

export class PasswordLoginDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  username!: string; // phone or email

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  password!: string;
}

export class RefreshDto {
  @IsString()
  @MinLength(20)
  refreshToken!: string;
}
