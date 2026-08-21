import { createAuthService } from '@my-hockey-network/auth';
import { mobileApiClient } from './api-client';
import { mobileAuthStorage } from './auth-storage';

export const mobileAuth = createAuthService(mobileApiClient, mobileAuthStorage);
