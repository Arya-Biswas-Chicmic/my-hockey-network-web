const BASE_URL = 'https://reposeful-kareen-controllingly.ngrok-free.dev/v1';

async function runSupervisionTests() {
  console.log('🚀 Starting Supervision API endpoints test...\n');

  const testEmail = `parent_${Date.now()}@example.com`;

  // Step 1: Request OTP
  console.log(`1️⃣ Requesting OTP for ${testEmail}...`);
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
  console.log('OTP Request Status:', otpReqRes.status, 'Response:', JSON.stringify(otpReqJson, null, 2));

  const otpCode = otpReqJson?.data?.devCode || otpReqJson?.data?.code || otpReqJson?.data?.otp || '123456';

  // Step 2: Verify OTP
  console.log(`\n2️⃣ Verifying OTP with code ${otpCode}...`);
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
  console.log('OTP Verify Status:', otpVerifyRes.status, 'Response:', JSON.stringify(otpVerifyJson, null, 2));

  const accessToken = otpVerifyJson?.data?.accessToken;

  const reqHeaders = {
    'Content-Type': 'application/json',
    'X-Client-Type': 'mobile',
    'ngrok-skip-browser-warning': 'true',
  };

  if (accessToken) {
    reqHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  // Step 3: Complete Onboarding (Create Parent Account)
  console.log('\n3️⃣ Completing Onboarding as Parent...');
  const onboardingRes = await fetch(`${BASE_URL}/auth/onboarding`, {
    method: 'POST',
    headers: reqHeaders,
    body: JSON.stringify({
      roles: ['PARENT'],
      displayName: 'Parent Test User',
      firstName: 'Parent',
      lastName: 'Test',
      dateOfBirth: '1985-05-15',
    }),
  });

  const onboardingJson = await onboardingRes.json();
  console.log('Onboarding Status:', onboardingRes.status, 'Response:', JSON.stringify(onboardingJson, null, 2));

  const onboardingToken = onboardingJson?.data?.accessToken || accessToken;
  if (onboardingToken) {
    reqHeaders['Authorization'] = `Bearer ${onboardingToken}`;
  }

  // 1. GET /v1/supervision
  console.log('\n4️⃣ Testing GET /v1/supervision...');
  try {
    const getSup = await fetch(`${BASE_URL}/supervision`, { method: 'GET', headers: reqHeaders });
    const jsonSup = await getSup.json();
    console.log('GET /v1/supervision:', getSup.status, JSON.stringify(jsonSup, null, 2));

    let minorId = 'test-minor-id';

    // 2. POST /v1/supervision/children
    console.log('\n5️⃣ Testing POST /v1/supervision/children...');
    const createChildRes = await fetch(`${BASE_URL}/supervision/children`, {
      method: 'POST',
      headers: reqHeaders,
      body: JSON.stringify({
        displayName: 'Noah Test Child',
        firstName: 'Noah',
        lastName: 'Test',
        dateOfBirth: '2015-05-15',
        guardianRelation: 'FATHER',
      }),
    });
    const createChildJson = await createChildRes.json();
    console.log('POST /v1/supervision/children:', createChildRes.status, JSON.stringify(createChildJson, null, 2));

    if (createChildJson?.data?.profile?.id || createChildJson?.data?.id || createChildJson?.child?.id || createChildJson?.id) {
      minorId = createChildJson?.data?.profile?.id || createChildJson?.data?.id || createChildJson?.child?.id || createChildJson?.id;
    }

    // 3. GET /v1/supervision/:minorId/controls
    console.log(`\n6️⃣ Testing GET /v1/supervision/${minorId}/controls...`);
    const getControls = await fetch(`${BASE_URL}/supervision/${minorId}/controls`, { method: 'GET', headers: reqHeaders });
    const jsonControls = await getControls.json();
    console.log(`GET /v1/supervision/${minorId}/controls:`, getControls.status, JSON.stringify(jsonControls, null, 2));

    // 4. PUT /v1/supervision/:minorId/controls
    console.log(`\n7️⃣ Testing PUT /v1/supervision/${minorId}/controls...`);
    const putControls = await fetch(`${BASE_URL}/supervision/${minorId}/controls`, {
      method: 'PUT',
      headers: reqHeaders,
      body: JSON.stringify({
        updates: [
          { control: 'REQUIRE_APPROVAL_CONNECTIONS', value: true },
          { control: 'PROFILE_VISIBILITY', value: 'CONNECTIONS' },
        ],
      }),
    });
    const jsonPutControls = await putControls.json();
    console.log(`PUT /v1/supervision/${minorId}/controls:`, putControls.status, JSON.stringify(jsonPutControls, null, 2));

    // 5. GET /v1/supervision/:minorId/logs
    console.log(`\n8️⃣ Testing GET /v1/supervision/${minorId}/logs...`);
    const getLogs = await fetch(`${BASE_URL}/supervision/${minorId}/logs`, { method: 'GET', headers: reqHeaders });
    const jsonLogs = await getLogs.json();
    console.log(`GET /v1/supervision/${minorId}/logs:`, getLogs.status, JSON.stringify(jsonLogs, null, 2));

  } catch (err) {
    console.error('❌ Supervision test error:', err);
  }
}

runSupervisionTests();
