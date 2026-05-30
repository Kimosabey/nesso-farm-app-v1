import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RevokedToken, RevokedTokenDocument } from './schemas/revoked-token.schema';

@Injectable()
export class RevokedTokensService {
  constructor(
    @InjectModel(RevokedToken.name)
    private readonly model: Model<RevokedTokenDocument>,
  ) {}

  async revoke(jti: string, userId: string, expEpochSeconds: number): Promise<void> {
    await this.model.updateOne(
      { jti },
      {
        $setOnInsert: {
          jti,
          userId,
          expiresAt: new Date(expEpochSeconds * 1000),
        },
      },
      { upsert: true },
    );
  }

  async isRevoked(jti: string): Promise<boolean> {
    const hit = await this.model.exists({ jti });
    return hit !== null;
  }
}
