export function validateGuardianApprovalCode(code: string): { isValid: boolean; error?: string } {
  const clean = code.trim();
  if (!clean || clean.length !== 6 || !/^\d{6}$/.test(clean)) {
    return { isValid: false, error: 'Approval code must be exactly 6 digits.' };
  }
  return { isValid: true };
}
