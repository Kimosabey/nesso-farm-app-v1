import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService, AuthSuccess } from './auth.service';
import { PasswordLoginDto, RefreshDto, VerifyOtpDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
  ) {}

  @Public()
  @Post('password')
  @HttpCode(200)
  @Throttle({ short: { ttl: 60_000, limit: 5 } })
  passwordLogin(@Body() dto: PasswordLoginDto): Promise<AuthSuccess> {
    return this.auth.passwordLogin(dto.username, dto.password);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @Throttle({ short: { ttl: 60_000, limit: 20 } })
  refresh(@Body() dto: RefreshDto): Promise<AuthSuccess> {
    return this.auth.refresh(dto.refreshToken);
  }

  @Public()
  @Post('otp/verify')
  @HttpCode(200)
  @Throttle({ short: { ttl: 60_000, limit: 5 } })
  verifyOtp(@Body() dto: VerifyOtpDto): Promise<AuthSuccess> {
    return this.auth.verifyOtp(dto.firebaseIdToken);
  }

  @ApiBearerAuth()
  @Get('me')
  async me(@CurrentUser() current: CurrentUserPayload) {
    const user = await this.users.findById(current.userId);
    if (!user) return null;
    return {
      id: user.id,
      phone: user.phone,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      preferredLanguage: user.preferredLanguage,
      lastLoginAt: user.lastLoginAt,
      mustChangePassword: user.mustChangePassword,
    };
  }

  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(204)
  async logout(@Body() dto: RefreshDto): Promise<void> {
    await this.auth.logout(dto.refreshToken);
  }
}
