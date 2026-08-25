export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface SignUpValidationResult {
  isValid: boolean;
  age?: number;
  isMinor: boolean;
  requiresParentApproval: boolean;
  error?: string;
}
