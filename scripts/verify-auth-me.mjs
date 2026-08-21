import { API_BASE_URL } from './load-api-base-url.mjs';

async function verifyAuthMe() {
  console.log('🚀 [Verification Script] Hitting GET /v1/auth/me...');
  
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Type': 'web',
      },
    });

    const status = res.status;
    const body = await res.json();
    console.log(`HTTP Status: ${status}`);
    console.log('Response Body:', JSON.stringify(body, null, 2));
  } catch (err) {
    console.error('Error fetching /v1/auth/me:', err);
  }
}

verifyAuthMe();
