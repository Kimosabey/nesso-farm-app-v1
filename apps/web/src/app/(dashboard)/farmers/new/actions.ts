'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { api, ApiError, readAccessToken, type CreateFarmerInput } from '@/lib/api';

export interface CreateFarmerState {
  error: string | null;
  fieldErrors?: Record<string, string>;
}

export async function createFarmerAction(
  _prev: CreateFarmerState,
  formData: FormData,
): Promise<CreateFarmerState> {
  const token = await readAccessToken();
  if (!token) return { error: 'Not signed in' };

  const firstName = String(formData.get('firstName') ?? '').trim();
  const lastName = String(formData.get('lastName') ?? '').trim();
  const mobileNumber = String(formData.get('mobileNumber') ?? '').trim();
  const gender = String(formData.get('gender') ?? '').trim() as 'M' | 'F' | 'Other' | '';
  const groupAssociation = String(formData.get('groupAssociation') ?? 'INDEPENDENT').trim() as
    | 'INDEPENDENT'
    | 'FLOWER_AGENT'
    | 'FPO';
  const isFlowerAgent = formData.get('isFlowerAgent') === 'on';
  const village = String(formData.get('village') ?? '').trim();
  const district = String(formData.get('district') ?? '').trim();
  const state = String(formData.get('state') ?? '').trim();
  const pincode = String(formData.get('pincode') ?? '').trim();
  const productionPractice = String(formData.get('productionPractice') ?? 'Conventional').trim() as
    | 'Organic'
    | 'Conventional'
    | 'NaturalFarming'
    | 'GAPCertified';
  const cropsRaw = String(formData.get('selectedCrops') ?? '').trim();
  const selectedCrops = cropsRaw
    ? cropsRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined;

  const fieldErrors: Record<string, string> = {};
  if (!firstName) fieldErrors.firstName = 'Required';
  if (!/^[6-9]\d{9}$/.test(mobileNumber))
    fieldErrors.mobileNumber = '10-digit Indian mobile starting 6-9';
  if (pincode && !/^\d{6}$/.test(pincode)) fieldErrors.pincode = '6 digits';
  if (Object.keys(fieldErrors).length > 0) {
    return { error: 'Please fix the highlighted fields', fieldErrors };
  }

  const input: CreateFarmerInput = {
    firstName,
    lastName: lastName || undefined,
    mobileNumber,
    gender: gender || undefined,
    groupAssociation,
    isFlowerAgent,
    address: {
      village: village || undefined,
      district: district || undefined,
      state: state || undefined,
      pincode: pincode || undefined,
    },
    productionPractice,
    selectedCrops,
  };

  let created;
  try {
    created = await api.createFarmer(token, input);
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    return { error: 'Could not reach the server' };
  }

  revalidatePath('/farmers');
  revalidatePath('/approvals');
  revalidatePath('/dashboard');
  redirect(`/farmers/${created._id}`);
}
