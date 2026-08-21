import { createAuthService } from '@my-hockey-network/auth';
import { webApiClient } from './api-client';
import { webAuthStorage } from './auth-storage';

export const webAuth = createAuthService(webApiClient, webAuthStorage);
