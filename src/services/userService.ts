import { HirerProfile, JobSeekerProfile, User } from '../types';

export async function saveHirerProfile(profile: HirerProfile): Promise<{ success: boolean; profile: HirerProfile }> {
  await new Promise(r => setTimeout(r, 500));
  // In Phase 2: POST /api/v1/users/hirer-profile
  return { success: true, profile };
}

export async function saveJobSeekerProfile(profile: JobSeekerProfile): Promise<{ success: boolean; profile: JobSeekerProfile }> {
  await new Promise(r => setTimeout(r, 500));
  // In Phase 2: POST /api/v1/users/job-seeker-profile
  return { success: true, profile };
}

export async function updateUserProfile(profile: Partial<User>): Promise<{ success: boolean }> {
  await new Promise(r => setTimeout(r, 400));
  // In Phase 2: PATCH /api/v1/users/:id
  return { success: true };
}

export async function verifyAadhaarDemo(aadhaarNumber: string, nameOnAadhaar: string): Promise<{ success: boolean; message: string }> {
  await new Promise(r => setTimeout(r, 800));
  // Strictly client-side demo verification. Do NOT store or transmit Aadhaar.
  const cleaned = aadhaarNumber.replace(/\s+/g, '');
  if (/^\d{12}$/.test(cleaned) && nameOnAadhaar.trim().length >= 2) {
    return { success: true, message: 'Identity Verified Successfully' };
  }
  return { success: false, message: 'Invalid Aadhaar Number or Name' };
}
