import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';

interface JwtPayload {
  sub: string;
  phone: string;
  role: string;
  type?: 'access' | 'refresh';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    const publicKeyPath = config.get<string>('JWT_PUBLIC_KEY_PATH') ?? './keys/public.pem';
    const publicKey = readFileSync(resolve(publicKeyPath), 'utf-8');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      algorithms: ['RS256'],
      issuer: 'nesso',
      audience: 'nesso-api',
    });
  }

  validate(payload: JwtPayload): CurrentUserPayload {
    if (payload.type && payload.type !== 'access') {
      throw new UnauthorizedException('Wrong token type');
    }
    return { userId: payload.sub, phone: payload.phone, role: payload.role };
  }
}
