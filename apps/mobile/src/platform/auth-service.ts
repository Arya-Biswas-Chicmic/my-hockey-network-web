import { createAuthService } from '@my-hockey-network/auth';
import { mobileApiClient } from '@/platform/api-client';
import { mobileAuthStorage } from '@/platform/auth-storage';

export const mobileAuth = createAuthService(mobileApiClient, mobileAuthStorage);
