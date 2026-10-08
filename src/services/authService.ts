// Demo auth service - replace with real backend in Phase 2
export interface SendOtpResult { success: boolean; message: string; }
export interface VerifyOtpResult { success: boolean; token?: string; message: string; }

export async function sendOtp(phoneNumber: string): Promise<SendOtpResult> {
  await new Promise(r => setTimeout(r, 800)); // simulate network
  return { success: true, message: 'OTP sent successfully' };
}

export async function verifyOtp(phoneNumber: string, otp: string): Promise<VerifyOtpResult> {
  await new Promise(r => setTimeout(r, 1000));
  if (otp === '1234') {
    return { success: true, token: 'demo_token_' + Date.now(), message: 'OTP verified' };
  }
  return { success: false, message: 'Invalid OTP' };
}
