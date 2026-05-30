'use server';

import { revalidatePath } from 'next/cache';
import { api, readAccessToken } from '@/lib/api';

export async function markAllReadAction() {
  const token = await readAccessToken();
  if (!token) return { ok: false };
  try {
    await api.markAllNotificationsRead(token);
    revalidatePath('/notifications');
    revalidatePath('/dashboard');
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function markOneReadAction(id: string) {
  const token = await readAccessToken();
  if (!token) return { ok: false };
  try {
    await api.markNotificationRead(token, id);
    revalidatePath('/notifications');
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
