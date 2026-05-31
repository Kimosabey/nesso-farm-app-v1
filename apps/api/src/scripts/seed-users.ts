/**
 * Per-role login seed.
 *
 * Creates exactly one demo login user for EVERY role in the shared `Roles`
 * array, so any role can be exercised against a live dev backend without
 * hand-crafting accounts.
 *
 * Conventions:
 *   - phone:    90000000NN where NN is a 2-digit index (01..18), one per role.
 *   - password: shared dev password (DEMO_PASSWORD below).
 *   - name:     a readable first/last name derived per role.
 *   - mustChangePassword: false → frictionless dev login.
 *
 * Idempotent: if a user with that phone already exists we leave the account
 * (only nudging its role/name back into shape if they drifted) instead of
 * crashing on the unique-phone conflict.
 *
 * Usage:
 *   pnpm --filter @nesso/api seed:users   (after build)
 *   pnpm --filter @nesso/api seed:all     (admin + catalog + users + demo)
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Roles } from '@nesso/shared-types';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';

/* eslint-disable no-console */

/** Shared dev password for every seeded role login. */
const DEMO_PASSWORD = 'Nesso!Demo!2026';

/** Readable first/last name per role. */
const ROLE_NAMES: Record<string, { firstName: string; lastName: string }> = {
  admin: { firstName: 'Admin', lastName: 'User' },
  orgMD: { firstName: 'Org MD', lastName: 'User' },
  orgNESSO: { firstName: 'Org NESSO', lastName: 'User' },
  orgTechSupport: { firstName: 'Tech', lastName: 'Support' },
  orgFieldOfficer: { firstName: 'Org Field', lastName: 'Officer' },
  orgFieldAssistant: { firstName: 'Org Field', lastName: 'Assistant' },
  orgAgent: { firstName: 'Org', lastName: 'Agent' },
  fieldOfficer: { firstName: 'Field', lastName: 'Officer' },
  flowerAgent: { firstName: 'Flower', lastName: 'Agent' },
  fpo: { firstName: 'FPO', lastName: 'User' },
  orgFPO: { firstName: 'Org FPO', lastName: 'User' },
  orgFPO1: { firstName: 'Org FPO1', lastName: 'User' },
  orgSouhardha: { firstName: 'Org', lastName: 'Souhardha' },
  farmer: { firstName: 'Farmer', lastName: 'User' },
  orgFarmer: { firstName: 'Org', lastName: 'Farmer' },
  procurementManager: { firstName: 'Procurement', lastName: 'Manager' },
  processor: { firstName: 'Processor', lastName: 'User' },
  qualityAuditor: { firstName: 'Quality', lastName: 'Auditor' },
};

function phoneForIndex(idx: number): string {
  // idx is 0-based; NN runs 01..18 → 90000000NN
  return `90000000${String(idx + 1).padStart(2, '0')}`;
}

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, { abortOnError: false });
  const users = app.get(UsersService);

  const table: Array<{ role: string; phone: string; password: string; action: string }> = [];

  for (let i = 0; i < Roles.length; i++) {
    const role = Roles[i];
    const phone = phoneForIndex(i);
    const names = ROLE_NAMES[role] ?? { firstName: role, lastName: 'User' };

    const existing = await users.findByPhone(phone);
    if (existing) {
      // Keep the account; just realign role + name if they drifted.
      let action = 'kept';
      const updates: Record<string, unknown> = {};
      if (existing.role !== role) updates.role = role;
      if (existing.firstName !== names.firstName) updates.firstName = names.firstName;
      if (existing.lastName !== names.lastName) updates.lastName = names.lastName;
      if (Object.keys(updates).length > 0) {
        existing.set(updates);
        await existing.save();
        action = 'updated';
      }
      table.push({ role, phone, password: '(unchanged)', action });
      continue;
    }

    await users.create({
      phone,
      password: DEMO_PASSWORD,
      firstName: names.firstName,
      lastName: names.lastName,
      role,
      mustChangePassword: false,
    });
    table.push({ role, phone, password: DEMO_PASSWORD, action: 'created' });
  }

  // --- Firebase OTP test-number users -----------------------------------------
  // These phones are registered as Firebase "test numbers" in the console
  // (no real SMS). The backend /auth/otp/verify looks the phone up in `users`
  // after Firebase validates the token, so each must exist here. The bootstrap
  // admin (9066666481) is seeded by seed-admin; we add the field-officer test
  // number 9876543210 so BOTH OTP test logins resolve to a real active user.
  const otpTestUsers: Array<{ phone: string; role: string; firstName: string; lastName: string }> = [
    { phone: '9876543210', role: 'fieldOfficer', firstName: 'OTP', lastName: 'Tester' },
  ];
  for (const u of otpTestUsers) {
    const existing = await users.findByPhone(u.phone);
    if (existing) {
      table.push({ role: u.role + ' (OTP)', phone: u.phone, password: '(unchanged)', action: 'kept' });
      continue;
    }
    await users.create({
      phone: u.phone,
      password: DEMO_PASSWORD,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      mustChangePassword: false,
    });
    table.push({ role: u.role + ' (OTP)', phone: u.phone, password: DEMO_PASSWORD, action: 'created' });
  }

  // --- Summary table ---------------------------------------------------------
  const roleW = Math.max(4, ...table.map((r) => r.role.length));
  const phoneW = 10;
  const pwW = Math.max(8, ...table.map((r) => r.password.length));
  const pad = (s: string, w: number) => s.padEnd(w);

  console.log('\n=========================================================');
  console.log(`Seeded ${table.length} per-role login users.`);
  console.log('---------------------------------------------------------');
  console.log(`${pad('ROLE', roleW)}  ${pad('PHONE', phoneW)}  ${pad('PASSWORD', pwW)}  ACTION`);
  for (const r of table) {
    console.log(`${pad(r.role, roleW)}  ${pad(r.phone, phoneW)}  ${pad(r.password, pwW)}  ${r.action}`);
  }
  console.log('---------------------------------------------------------');
  console.log(`Shared dev password: ${DEMO_PASSWORD}`);
  console.log('=========================================================');

  await app.close();
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
