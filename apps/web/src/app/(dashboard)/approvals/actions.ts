'use server';

import { revalidatePath } from 'next/cache';
import { api, readAccessToken } from '@/lib/api';

export interface ApprovalResult {
  ok: boolean;
  error?: string;
}

export async function approveFarmerAction(id: string): Promise<ApprovalResult> {
  const token = await readAccessToken();
  if (!token) return { ok: false, error: 'Not signed in' };
  try {
    await api.approveFarmer(token, id, true);
    revalidatePath('/approvals');
    revalidatePath(`/farmers/${id}`);
    revalidatePath('/farmers');
    revalidatePath('/dashboard');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Approve failed' };
  }
}

export async function rejectFarmerAction(id: string, reason: string): Promise<ApprovalResult> {
  const token = await readAccessToken();
  if (!token) return { ok: false, error: 'Not signed in' };
  if (!reason || reason.trim().length < 3) {
    return { ok: false, error: 'Provide a short reason (≥ 3 chars)' };
  }
  try {
    await api.approveFarmer(token, id, false, reason.trim());
    revalidatePath('/approvals');
    revalidatePath(`/farmers/${id}`);
    revalidatePath('/farmers');
    revalidatePath('/dashboard');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Reject failed' };
  }
}
