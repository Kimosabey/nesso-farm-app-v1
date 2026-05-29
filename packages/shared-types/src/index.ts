/**
 * @nesso/shared-types
 *
 * Zod schemas + generated TS types shared across api / web / portal / mobile.
 * Add a schema here once; consume it everywhere. Server enforces, clients infer.
 */

import { z } from 'zod';

// --- Common ---

export const ObjectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');
export type ObjectId = z.infer<typeof ObjectIdSchema>;

export const MobileNumberSchema = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number');
export const PincodeSchema = z.string().regex(/^\d{6}$/);
export const IfscSchema = z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/);
export const PanSchema = z.string().regex(/^[A-Z]{5}\d{4}[A-Z]$/);
export const AadhaarSchema = z.string().regex(/^\d{12}$/);

// --- Auth ---

export const LoginPasswordSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
export type LoginPasswordPayload = z.infer<typeof LoginPasswordSchema>;

export const OtpSendSchema = z.object({
  phone: MobileNumberSchema,
});

export const OtpVerifySchema = z.object({
  sessionId: z.string(),
  otp: z.string().regex(/^\d{6}$/),
  firebaseIdToken: z.string(),
});

// --- Farmer (minimal v0; extended in Phase 2) ---

export const ApprovalStatusSchema = z.enum(['pending', 'approved', 'rejected']);
export type ApprovalStatus = z.infer<typeof ApprovalStatusSchema>;

// --- Domain enums ---

export const Roles = [
  'admin',
  'orgMD',
  'orgNESSO',
  'orgTechSupport',
  'orgFieldOfficer',
  'orgFieldAssistant',
  'orgAgent',
  'fieldOfficer',
  'flowerAgent',
  'fpo',
  'orgFPO',
  'orgFPO1',
  'orgSouhardha',
  'farmer',
  'orgFarmer',
  'procurementManager',
  'processor',
  'qualityAuditor',
] as const;
export const RoleSchema = z.enum(Roles);
export type Role = z.infer<typeof RoleSchema>;
