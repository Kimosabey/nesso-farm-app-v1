import { Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import * as admin from 'firebase-admin';

export interface VerifiedFirebaseToken {
  uid: string;
  phone?: string;
  email?: string;
  raw: admin.auth.DecodedIdToken;
}

@Injectable()
export class FirebaseService {
  private app: admin.app.App | null = null;
  public projectId: string | null = null;

  constructor(private readonly config: ConfigService) {}

  /**
   * Initialize firebase-admin from the service account JSON.
   * Returns false (and does NOT throw) when the file is missing — the API
   * boots either way; only OTP-verify routes will refuse to work.
   */
  async init(): Promise<boolean> {
    if (this.app) return true;

    const relPath =
      this.config.get<string>('FIREBASE_SERVICE_ACCOUNT_PATH') ??
      './keys/firebase-service-account.json';
    const fullPath = resolve(relPath);

    if (!existsSync(fullPath)) {
      return false;
    }

    try {
      const json = JSON.parse(readFileSync(fullPath, 'utf-8')) as admin.ServiceAccount & {
        project_id?: string;
      };
      this.app = admin.initializeApp({
        credential: admin.credential.cert(json),
        projectId: json.project_id,
      });
      this.projectId = json.project_id ?? null;
      return true;
    } catch {
      // Bad JSON / wrong format — leave uninitialized so the warning surfaces
      return false;
    }
  }

  isReady(): boolean {
    return this.app !== null;
  }

  /**
   * Verify a Firebase ID token (signed by Google after the OTP step on mobile).
   * Returns the decoded claims; raises 401 on any failure.
   */
  async verifyIdToken(idToken: string): Promise<VerifiedFirebaseToken> {
    if (!this.app) {
      throw new ServiceUnavailableException(
        'Firebase is not configured on the server. See docs/FIREBASE_SETUP.md',
      );
    }
    try {
      const decoded = await this.app.auth().verifyIdToken(idToken, true);
      return {
        uid: decoded.uid,
        phone: decoded.phone_number ?? undefined,
        email: decoded.email ?? undefined,
        raw: decoded,
      };
    } catch (e) {
      throw new UnauthorizedException(
        `Firebase token invalid: ${(e as Error).message ?? 'unknown'}`,
      );
    }
  }

  /**
   * Strip the leading "+91" (or whatever country code) from a Firebase
   * phone-formatted number to match how we store mobileNumber in Mongo.
   * Defensive: returns null if it can't be normalized to a 10-digit Indian number.
   */
  static normalizeIndianMobile(intlPhone: string | undefined): string | null {
    if (!intlPhone) return null;
    const digits = intlPhone.replace(/[^\d]/g, '');
    if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
    if (digits.length === 10 && /^[6-9]/.test(digits)) return digits;
    return null;
  }
}
