'use server';

import { revalidatePath } from 'next/cache';
import { api, readAccessToken } from '@/lib/api';

export async function markAllReadAction(): Promise<void> {
  const token = await readAccessToken();
  if (!token) return;
  try {
    await api.markAllNotificationsRead(token);
    revalidatePath('/notifications');
    revalidatePath('/dashboard');
  } catch {
    // swallow — UI will reflect the actual unread count on next render
  }
}

export async function markOneReadAction(id: string): Promise<void> {
  const token = await readAccessToken();
  if (!token) return;
  try {
    await api.markNotificationRead(token, id);
    revalidatePath('/notifications');
  } catch {
    // swallow
  }
}
