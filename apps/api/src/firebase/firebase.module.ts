import { Global, Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from './firebase.service';

@Global()
@Module({
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule implements OnModuleInit {
  private readonly logger = new Logger(FirebaseModule.name);

  constructor(
    private readonly firebase: FirebaseService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    // Don't crash the API if Firebase isn't configured yet —
    // password login still works, only OTP needs it.
    const ok = await this.firebase.init();
    if (ok) {
      this.logger.log(`Firebase Admin initialized for project "${this.firebase.projectId}"`);
    } else {
      const path = this.config.get<string>('FIREBASE_SERVICE_ACCOUNT_PATH');
      this.logger.warn(
        `Firebase NOT initialized (FIREBASE_SERVICE_ACCOUNT_PATH=${path ?? 'unset'}). ` +
          `/auth/otp/verify will return 503 until the service account JSON is in place.`,
      );
    }
  }
}
