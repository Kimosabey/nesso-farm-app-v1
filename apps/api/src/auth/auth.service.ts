import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { randomUUID } from 'crypto';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { FirebaseService } from '../firebase/firebase.service';
import { RevokedTokensService } from './revoked-tokens.service';

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
    private readonly firebase: FirebaseService,
    private readonly revoked: RevokedTokensService,
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

  /**
   * Exchange a Firebase ID token (from mobile, after the Phone-OTP step) for
   * our own RS256 access + refresh tokens.
   *
   * Behavior:
   *   1. Verify the Firebase ID token against Google's public keys
   *   2. Pull the phone number from the decoded token
   *   3. Look up an existing `users` row by that phone
   *   4. If found, issue our tokens (preserving the existing role)
   *   5. If not found, refuse — staff must be pre-provisioned by an admin.
   *      (Auto-creating "farmer" users via this path is a Phase 6 decision —
   *      farmers live in a different collection with KYC + approval status.)
   */
  async verifyOtp(firebaseIdToken: string): Promise<AuthSuccess> {
    const verified = await this.firebase.verifyIdToken(firebaseIdToken);
    const phone = FirebaseService.normalizeIndianMobile(verified.phone);
    if (!phone) {
      throw new UnauthorizedException(
        `Firebase token has no usable Indian mobile number (got "${verified.phone ?? 'none'}")`,
      );
    }
    const user = await this.users.findByPhone(phone);
    if (!user) {
      throw new NotFoundException(
        `No staff account exists for phone ${phone}. Ask an admin to register you first.`,
      );
    }
    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is inactive');
    }
    await this.users.markLoggedIn(user.id as string);
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthSuccess> {
    const payload = this.verifyRefreshToken(refreshToken);
    if (payload.jti && (await this.revoked.isRevoked(payload.jti))) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }
    const user = await this.users.findById(payload.sub);
    if (!user || user.status !== 'active' || user.isDeleted) {
      throw new UnauthorizedException('User no longer active');
    }
    return this.issueTokens(user);
  }

  /**
   * Revoke a refresh token so its remaining lifespan can't be used to mint new
   * access tokens. Idempotent — calling logout twice with the same token is fine.
   *
   * Returns silently when given a token that's malformed or already expired:
   * logging out a session that's already dead should not surface as an error
   * to the client (clients call this on app teardown / 401, when the token's
   * state isn't predictable).
   */
  async logout(refreshToken: string): Promise<void> {
    let payload: RefreshTokenPayload;
    try {
      payload = this.verifyRefreshToken(refreshToken);
    } catch {
      return;
    }
    if (!payload.jti || !payload.exp) return;
    await this.revoked.revoke(payload.jti, payload.sub, payload.exp);
  }

  private verifyRefreshToken(refreshToken: string): RefreshTokenPayload {
    let payload: RefreshTokenPayload;
    try {
      payload = this.jwt.verify<RefreshTokenPayload>(refreshToken, {
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
    return payload;
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
        jwtid: randomUUID(),
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
        jwtid: randomUUID(),
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

interface RefreshTokenPayload {
  sub: string;
  phone: string;
  role: string;
  type?: string;
  jti?: string;
  exp?: number;
}

function parseTtlToSeconds(ttl: string): number {
  const m = /^(\d+)([smhd])$/.exec(ttl);
  if (!m) return 900;
  const n = Number(m[1]);
  const unit = m[2];
  return unit === 's' ? n : unit === 'm' ? n * 60 : unit === 'h' ? n * 3600 : n * 86400;
}
