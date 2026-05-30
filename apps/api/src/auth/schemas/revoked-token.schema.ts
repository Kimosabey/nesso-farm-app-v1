import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RevokedTokenDocument = HydratedDocument<RevokedToken>;

/**
 * Refresh-token revocation list.
 *
 * On logout we insert the token's `jti` here with an `expiresAt` equal to its
 * original `exp` claim. Mongo's TTL monitor deletes the row at that time so
 * the collection stays bounded even though refresh tokens live 30 days.
 *
 * Storing the jti — not the token itself — lets us revoke tokens without
 * keeping their (sensitive) raw value in our database.
 */
@Schema({ collection: 'revoked_tokens', timestamps: { createdAt: true, updatedAt: false } })
export class RevokedToken {
  @Prop({ required: true, unique: true, index: true })
  jti!: string;

  @Prop({ required: true, index: true })
  userId!: string;

  /** Set to the token's original `exp` claim; Mongo's TTL monitor deletes the row at this time. */
  @Prop({ required: true, expires: 0 })
  expiresAt!: Date;
}

export const RevokedTokenSchema = SchemaFactory.createForClass(RevokedToken);
