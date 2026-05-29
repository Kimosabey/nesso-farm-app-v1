/**
 * Bootstrap admin seed.
 * Reads BOOTSTRAP_ADMIN_PHONE + BOOTSTRAP_ADMIN_PASSWORD from env.
 * Creates the admin user if it doesn't exist. Idempotent.
 *
 * Usage: pnpm --filter @nesso/api seed:admin
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, { abortOnError: false });
  const config = app.get(ConfigService);
  const users = app.get(UsersService);

  const phone = config.get<string>('BOOTSTRAP_ADMIN_PHONE');
  const password = config.get<string>('BOOTSTRAP_ADMIN_PASSWORD');

  if (!phone || !password) {
    // eslint-disable-next-line no-console
    console.error('BOOTSTRAP_ADMIN_PHONE and BOOTSTRAP_ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  const existing = await users.findByPhone(phone);
  if (existing) {
    // eslint-disable-next-line no-console
    console.log(`Admin already exists: ${phone}`);
    await app.close();
    return;
  }

  await users.create({
    phone,
    password,
    firstName: 'Bootstrap',
    lastName: 'Admin',
    role: 'admin',
    mustChangePassword: true,
  });

  // eslint-disable-next-line no-console
  console.log(`✓ Admin seeded: ${phone}`);
  // eslint-disable-next-line no-console
  console.log('  Sign in on the web with this phone + the password from .env.');
  await app.close();
}

void main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
