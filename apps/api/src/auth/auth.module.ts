import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RevokedTokensService } from './revoked-tokens.service';
import { RevokedToken, RevokedTokenSchema } from './schemas/revoked-token.schema';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    MongooseModule.forFeature([{ name: RevokedToken.name, schema: RevokedTokenSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RevokedTokensService],
  exports: [AuthService],
})
export class AuthModule {}
