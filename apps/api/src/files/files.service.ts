import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

const PRESIGN_PUT_TTL = 60 * 15; // 15 min
const PRESIGN_GET_TTL = 60 * 15;

const ALLOWED_KINDS = new Set([
  'profile',
  'id-proof',
  'bank-passbook',
  'farm-map',
  'farm-photo',
  'activity-photo',
  'audit-attachment',
]);

const ALLOWED_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'application/pdf',
]);

export interface SignUploadInput {
  kind: string;
  contentType: string;
}

export interface SignUploadResult {
  uploadUrl: string;
  key: string;
  expiresAt: string;
}

@Injectable()
export class FilesService {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(config: ConfigService) {
    this.bucket = config.get<string>('S3_BUCKET') ?? 'nesso-dev';
    this.client = new S3Client({
      endpoint: config.get<string>('S3_ENDPOINT'),
      region: config.get<string>('S3_REGION') ?? 'us-east-1',
      forcePathStyle: (config.get<string>('S3_FORCE_PATH_STYLE') ?? 'true') === 'true',
      credentials: {
        accessKeyId: config.get<string>('S3_ACCESS_KEY') ?? '',
        secretAccessKey: config.get<string>('S3_SECRET_KEY') ?? '',
      },
    });
  }

  async signUpload(input: SignUploadInput): Promise<SignUploadResult> {
    if (!ALLOWED_KINDS.has(input.kind)) {
      throw new BadRequestException(`Unknown upload kind '${input.kind}'`);
    }
    if (!ALLOWED_CONTENT_TYPES.has(input.contentType)) {
      throw new BadRequestException(`Content type '${input.contentType}' not allowed`);
    }
    const ext = input.contentType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'bin';
    const key = `${input.kind}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${ext}`;

    const url = await getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: input.contentType,
      }),
      { expiresIn: PRESIGN_PUT_TTL },
    );

    return {
      uploadUrl: url,
      key,
      expiresAt: new Date(Date.now() + PRESIGN_PUT_TTL * 1000).toISOString(),
    };
  }

  async signRead(key: string): Promise<{ url: string; expiresAt: string }> {
    if (!key) throw new BadRequestException('key is required');
    const url = await getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: PRESIGN_GET_TTL },
    );
    return {
      url,
      expiresAt: new Date(Date.now() + PRESIGN_GET_TTL * 1000).toISOString(),
    };
  }
}
