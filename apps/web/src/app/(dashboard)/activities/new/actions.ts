'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { api, ApiError, readAccessToken, type ActivityInput, type CreateActivityInput } from '@/lib/api';

export interface CreateActivityState {
  error: string | null;
}

export async function createActivityAction(
  _prev: CreateActivityState,
  formData: FormData,
): Promise<CreateActivityState> {
  const token = await readAccessToken();
  if (!token) return { error: 'Not signed in' };

  const farmerId = String(formData.get('farmerId') ?? '');
  const farmId = String(formData.get('farmId') ?? '');
  const cropId = String(formData.get('cropId') ?? '') || undefined;
  const activity = String(formData.get('activity') ?? '').trim();
  const completedDate = String(formData.get('completedDate') ?? '') || undefined;
  const scheduledOn = String(formData.get('scheduledOn') ?? '') || undefined;
  const notes = String(formData.get('notes') ?? '').trim() || undefined;
  const inputsJson = String(formData.get('inputsJson') ?? '[]');

  if (!farmerId || !farmId || !activity) {
    return { error: 'Pick a farmer, a farm, and an activity type' };
  }

  let inputs: ActivityInput[] = [];
  try {
    const parsed = JSON.parse(inputsJson);
    if (Array.isArray(parsed)) inputs = parsed;
  } catch {
    return { error: 'Inputs payload corrupted; refresh and try again' };
  }

  const payload: CreateActivityInput = {
    farmerId,
    farmId,
    cropId,
    activity,
    completedDate,
    scheduledOn,
    notes,
    inputs,
    status: completedDate ? 'Completed' : 'Pending',
  };

  try {
    await api.createActivity(token, payload);
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Could not save activity' };
  }

  revalidatePath('/activities');
  revalidatePath('/dashboard');
  redirect('/activities');
}
