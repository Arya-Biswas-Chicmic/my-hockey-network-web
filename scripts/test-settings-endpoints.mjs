import { API_BASE_URL as BASE_URL } from './load-api-base-url.mjs';

async function runSettingsTests() {
  console.log('🚀 Starting Settings API endpoints test...\n');

  const testEmail = `settings_test_${Date.now()}@example.com`;

  // Step 1: Request OTP
  const otpReqRes = await fetch(`${BASE_URL}/auth/otp/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Type': 'mobile',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify({
      channel: 'EMAIL',
      destination: testEmail,
      intent: 'SIGNUP',
    }),
  });

  const otpReqJson = await otpReqRes.json();
  const otpCode = otpReqJson?.data?.devCode || '123456';

  // Step 2: Verify OTP
  const otpVerifyRes = await fetch(`${BASE_URL}/auth/otp/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Type': 'mobile',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify({
      channel: 'EMAIL',
      destination: testEmail,
      code: String(otpCode),
      intent: 'SIGNUP',
    }),
  });

  const otpVerifyJson = await otpVerifyRes.json();
  const accessToken = otpVerifyJson?.data?.accessToken;

  const reqHeaders = {
    'Content-Type': 'application/json',
    'X-Client-Type': 'mobile',
    'ngrok-skip-browser-warning': 'true',
    'Authorization': `Bearer ${accessToken}`,
  };

  // Step 3: Complete Onboarding
  const onboardingRes = await fetch(`${BASE_URL}/auth/onboarding`, {
    method: 'POST',
    headers: reqHeaders,
    body: JSON.stringify({
      roles: ['PLAYER'],
      displayName: 'Settings Test Player',
      firstName: 'Settings',
      lastName: 'Test',
      dateOfBirth: '2000-01-01',
    }),
  });
  const onboardingJson = await onboardingRes.json();
  const activeToken = onboardingJson?.data?.accessToken || accessToken;
  reqHeaders['Authorization'] = `Bearer ${activeToken}`;

  // 1. GET /v1/settings/notifications
  console.log('\n1️⃣ Testing GET /v1/settings/notifications...');
  try {
    const getNotif = await fetch(`${BASE_URL}/settings/notifications`, { method: 'GET', headers: reqHeaders });
    const jsonNotif = await getNotif.json();
    console.log('GET /v1/settings/notifications status:', getNotif.status);
    console.log('GET /v1/settings/notifications response:\n', JSON.stringify(jsonNotif, null, 2));
  } catch (err) {
    console.error('GET /v1/settings/notifications error:', err);
  }

  // 2. PUT /v1/settings/notifications
  console.log('\n2️⃣ Testing PUT /v1/settings/notifications...');
  try {
    const putNotif = await fetch(`${BASE_URL}/settings/notifications`, {
      method: 'PUT',
      headers: reqHeaders,
      body: JSON.stringify({
        messages: false,
        connectionRequests: true,
        activity: false,
        mentions: true,
        group: false,
      }),
    });
    const jsonPutNotif = await putNotif.json();
    console.log('PUT /v1/settings/notifications status:', putNotif.status);
    console.log('PUT /v1/settings/notifications response:\n', JSON.stringify(jsonPutNotif, null, 2));
  } catch (err) {
    console.error('PUT /v1/settings/notifications error:', err);
  }

  // 3. GET /v1/settings/blocked
  console.log('\n3️⃣ Testing GET /v1/settings/blocked...');
  try {
    const getBlocked = await fetch(`${BASE_URL}/settings/blocked`, { method: 'GET', headers: reqHeaders });
    const jsonBlocked = await getBlocked.json();
    console.log('GET /v1/settings/blocked status:', getBlocked.status);
    console.log('GET /v1/settings/blocked response:\n', JSON.stringify(jsonBlocked, null, 2));
  } catch (err) {
    console.error('GET /v1/settings/blocked error:', err);
  }
}

runSettingsTests();
