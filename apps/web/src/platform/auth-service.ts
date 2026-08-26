import { createAuthService } from '@my-hockey-network/auth';
import { webApiClient } from '@/platform/api-client';
import { webAuthStorage } from '@/platform/auth-storage';

export const webAuth = createAuthService(webApiClient, webAuthStorage);
