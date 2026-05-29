'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { api, ApiError } from '@/lib/api';

export interface LoginState {
  error: string | null;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!username || !password) {
    return { error: 'Phone and password are required.' };
  }

  try {
    const res = await api.passwordLogin(username, password);
    const store = await cookies();
    store.set('nesso_session', res.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: res.expiresIn, // tied to JWT TTL
    });
    store.set('nesso_refresh', res.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return { error: err.message };
    }
    return { error: 'Could not reach the server. Is the API running on :4000?' };
  }

  redirect('/dashboard');
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete('nesso_session');
  store.delete('nesso_refresh');
  redirect('/login');
}
