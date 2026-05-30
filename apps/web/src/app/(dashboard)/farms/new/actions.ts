'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { api, ApiError, readAccessToken, type CreateFarmInput } from '@/lib/api';

export interface CreateFarmState {
  error: string | null;
}

export async function createFarmAction(
  _prev: CreateFarmState,
  formData: FormData,
): Promise<CreateFarmState> {
  const token = await readAccessToken();
  if (!token) return { error: 'Not signed in' };

  const farmerId = String(formData.get('farmerId') ?? '');
  const farmName = String(formData.get('farmName') ?? '').trim();
  const surveyNumber = String(formData.get('surveyNumber') ?? '').trim() || undefined;
  const farmArea = Number(formData.get('farmArea') ?? 0);
  const growingArea = Number(formData.get('growingArea') ?? 0) || undefined;
  const organicStage = String(formData.get('organicStage') ?? 'Conventional') as
    | 'Certified'
    | 'InTransition'
    | 'Conventional';
  const latitude = Number(formData.get('latitude') ?? NaN);
  const longitude = Number(formData.get('longitude') ?? NaN);
  const village = String(formData.get('village') ?? '').trim() || undefined;
  const district = String(formData.get('district') ?? '').trim() || undefined;
  const state = String(formData.get('state') ?? '').trim() || undefined;
  const pincode = String(formData.get('pincode') ?? '').trim() || undefined;

  if (!farmerId || !farmName) return { error: 'Pick a farmer and give the farm a name' };
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return { error: 'Place a pin on the map to set GPS coordinates' };
  }
  if (!Number.isFinite(farmArea) || farmArea <= 0) {
    return { error: 'Farm area must be greater than 0 acres' };
  }

  const input: CreateFarmInput = {
    farmerId,
    farmName,
    surveyNumber,
    farmArea,
    growingArea,
    organicStage,
    latitude,
    longitude,
    address: { state, district, village, pincode },
  };

  try {
    const created = await api.createFarm(token, input);
    revalidatePath('/farms');
    revalidatePath('/dashboard');
    revalidatePath(`/farmers/${farmerId}`);
    redirect(`/farms`);
    return { error: null }; // unreachable — redirect throws
  } catch (err) {
    // Re-throw Next.js redirect errors so they propagate
    if (err && typeof err === 'object' && 'digest' in err) throw err;
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Could not save farm' };
  }
}
