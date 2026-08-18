async function verifyAuthMe() {
  const BASE_URL = 'https://reposeful-kareen-controllingly.ngrok-free.dev/v1';
  console.log('🚀 [Verification Script] Hitting GET /v1/auth/me...');
  
  try {
    const res = await fetch(`${BASE_URL}/auth/me`, {
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
