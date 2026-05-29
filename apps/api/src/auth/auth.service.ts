import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthSuccess extends AuthTokens {
  user: {
    id: string;
    phone: string;
    role: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    mustChangePassword: boolean;
  };
}

@Injectable()
export class AuthService {
  private readonly privateKey: string;
  private readonly accessTtl: string;
  private readonly refreshTtl: string;

  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    const keyPath = this.config.get<string>('JWT_PRIVATE_KEY_PATH') ?? './keys/private.pem';
    this.privateKey = readFileSync(resolve(keyPath), 'utf-8');
    this.accessTtl = this.config.get<string>('JWT_ACCESS_TTL') ?? '15m';
    this.refreshTtl = this.config.get<string>('JWT_REFRESH_TTL') ?? '30d';
  }

  async passwordLogin(username: string, password: string): Promise<AuthSuccess> {
    const user = await this.users.findByPhoneOrEmail(username);
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('Phone or password is incorrect');
    }
    const ok = await this.users.verifyPassword(user, password);
    if (!ok) {
      throw new UnauthorizedException('Phone or password is incorrect');
    }
    await this.users.markLoggedIn(user.id as string);
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthSuccess> {
    let payload: { sub: string; phone: string; role: string; type?: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        algorithms: ['RS256'],
        publicKey: readFileSync(
          resolve(this.config.get<string>('JWT_PUBLIC_KEY_PATH') ?? './keys/public.pem'),
          'utf-8',
        ),
        issuer: 'nesso',
        audience: 'nesso-api',
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Wrong token type');
    }
    const user = await this.users.findById(payload.sub);
    if (!user || user.status !== 'active' || user.isDeleted) {
      throw new UnauthorizedException('User no longer active');
    }
    return this.issueTokens(user);
  }

  private async issueTokens(user: UserDocument): Promise<AuthSuccess> {
    const base = {
      sub: user.id as string,
      phone: user.phone,
      role: user.role,
    };
    const accessToken = await this.jwt.signAsync(
      { ...base, type: 'access' },
      {
        algorithm: 'RS256',
        privateKey: this.privateKey,
        expiresIn: this.accessTtl,
        issuer: 'nesso',
        audience: 'nesso-api',
      },
    );
    const refreshToken = await this.jwt.signAsync(
      { ...base, type: 'refresh' },
      {
        algorithm: 'RS256',
        privateKey: this.privateKey,
        expiresIn: this.refreshTtl,
        issuer: 'nesso',
        audience: 'nesso-api',
      },
    );
    return {
      accessToken,
      refreshToken,
      expiresIn: parseTtlToSeconds(this.accessTtl),
      user: {
        id: user.id as string,
        phone: user.phone,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mustChangePassword: user.mustChangePassword,
      },
    };
  }
}

function parseTtlToSeconds(ttl: string): number {
  const m = /^(\d+)([smhd])$/.exec(ttl);
  if (!m) return 900;
  const n = Number(m[1]);
  const unit = m[2];
  return unit === 's' ? n : unit === 'm' ? n * 60 : unit === 'h' ? n * 3600 : n * 86400;
}
