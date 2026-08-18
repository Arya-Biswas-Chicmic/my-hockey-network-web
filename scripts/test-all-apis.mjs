const BASE_URL = 'https://reposeful-kareen-controllingly.ngrok-free.dev/v1';

const results = [];

function recordResult(module, endpoint, method, status, statusCode, message, responseData, missingOrIssue, actionRequired) {
  results.push({
    module,
    endpoint,
    method,
    status, // WORKING | PARTIALLY_WORKING | BLOCKED | FAILED
    statusCode,
    message,
    responseData,
    missingOrIssue,
    actionRequired,
  });
}

async function testEndpoint(module, endpoint, method, body = null, headers = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const requestHeaders = {
    'Content-Type': 'application/json',
    'X-Client-Type': 'web',
    'Accept-Language': 'en',
    'ngrok-skip-browser-warning': 'true',
    ...headers,
  };

  const options = {
    method,
    headers: requestHeaders,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, options);
    let json = null;
    try {
      json = await res.json();
    } catch (e) {
      json = { raw: await res.text() };
    }

    return {
      httpStatus: res.status,
      ok: res.ok,
      json,
      headers: res.headers,
    };
  } catch (err) {
    return {
      httpStatus: 0,
      ok: false,
      error: err.message,
    };
  }
}

async function runAllTests() {
  console.log('=== STARTING ALL API ENDPOINT INTEGRATION & RESPONSE TESTS ===\n');

  // 1. Health Checks
  console.log('1. Testing Health Checks...');
  const h1 = await testEndpoint('Health', '/health', 'GET');
  console.log('GET /v1/health:', h1.httpStatus, JSON.stringify(h1.json));
  recordResult('Health', '/v1/health', 'GET', h1.ok ? 'WORKING' : 'BLOCKED', h1.httpStatus, h1.json?.message || 'OK', h1.json, h1.ok ? 'None' : 'Health check failed', h1.ok ? 'None' : 'Ensure server is up');

  const h2 = await testEndpoint('Health', '/health/ready', 'GET');
  console.log('GET /v1/health/ready:', h2.httpStatus, JSON.stringify(h2.json));
  recordResult('Health', '/v1/health/ready', 'GET', h2.ok ? 'WORKING' : 'BLOCKED', h2.httpStatus, h2.json?.message || 'OK', h2.json, h2.ok ? 'None' : 'DB/Redis ready check failed', h2.ok ? 'None' : 'Verify Postgres and Redis connections');

  // 2. Auth OTP Request & Verify (Signup Flow)
  console.log('\n2. Testing Auth Module...');
  const testEmail = `testuser_${Date.now()}@example.com`;
  const otpReq = await testEndpoint('Auth', '/auth/otp/request', 'POST', {
    channel: 'EMAIL',
    destination: testEmail,
    intent: 'SIGNUP',
  }, { 'X-Client-Type': 'mobile' });
  console.log('POST /v1/auth/otp/request full output:', JSON.stringify(otpReq.json, null, 2));
  recordResult('Auth', '/v1/auth/otp/request', 'POST', otpReq.ok ? 'WORKING' : 'FAILED', otpReq.httpStatus, otpReq.json?.message, otpReq.json, otpReq.ok ? 'None' : (otpReq.json?.message || 'OTP request failed'), otpReq.ok ? 'None' : 'Check OTP mailer service');

  let otpCode = otpReq.json?.data?.code || otpReq.json?.data?.otp || '123456';
  const otpVerify = await testEndpoint('Auth', '/auth/otp/verify', 'POST', {
    channel: 'EMAIL',
    destination: testEmail,
    code: otpCode,
    intent: 'SIGNUP',
  }, { 'X-Client-Type': 'mobile' });
  console.log('POST /v1/auth/otp/verify:', otpVerify.httpStatus, JSON.stringify(otpVerify.json));
  recordResult('Auth', '/v1/auth/otp/verify', 'POST', otpVerify.ok ? 'WORKING' : 'FAILED', otpVerify.httpStatus, otpVerify.json?.message, otpVerify.json, otpVerify.ok ? 'None' : (otpVerify.json?.message || 'OTP code invalid/expired'), otpVerify.ok ? 'None' : 'Verify OTP dev code environment settings');

  // Extract Bearer token
  let sessionHeaders = { 'X-Client-Type': 'mobile' };
  const accessToken = otpVerify.json?.data?.accessToken;
  if (accessToken) {
    sessionHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  // 3. Auth Onboarding
  console.log('\n3. Testing Auth Onboarding...');
  const onboardRes = await testEndpoint('Auth', '/auth/onboarding', 'POST', {
    roles: ['PLAYER', 'PARENT'],
    displayName: 'Test Player Parent',
    firstName: 'Test',
    lastName: 'User',
    dateOfBirth: '2012-05-15',
    city: 'Toronto',
    preferredLanguage: 'en',
  }, sessionHeaders);
  console.log('POST /v1/auth/onboarding:', onboardRes.httpStatus, JSON.stringify(onboardRes.json));
  recordResult('Auth', '/v1/auth/onboarding', 'POST', onboardRes.ok ? 'WORKING' : 'FAILED', onboardRes.httpStatus, onboardRes.json?.message, onboardRes.json, onboardRes.ok ? 'None' : (onboardRes.json?.message || 'Onboarding failed'), onboardRes.ok ? 'None' : 'Check onboarding handler');

  // 4. Auth Me
  console.log('\n4. Testing GET /v1/auth/me...');
  const authMe = await testEndpoint('Auth', '/auth/me', 'GET', null, sessionHeaders);
  console.log('GET /v1/auth/me:', authMe.httpStatus, JSON.stringify(authMe.json));
  recordResult('Auth', '/v1/auth/me', 'GET', authMe.ok ? 'WORKING' : 'FAILED', authMe.httpStatus, authMe.json?.message, authMe.json, authMe.ok ? 'None' : 'Auth Me failed', authMe.ok ? 'None' : 'Check session resolver');

  // 5. Guardian Invites (Parent -> Child)
  console.log('\n5. Testing Guardian Invites...');
  const childEmail = `child_${Date.now()}@example.com`;
  const gInvite = await testEndpoint('Guardian Invites', '/relationships/guardian-invites', 'POST', { childEmail }, sessionHeaders);
  console.log('POST /v1/relationships/guardian-invites:', gInvite.httpStatus, JSON.stringify(gInvite.json));
  recordResult('Guardian Invites', '/v1/relationships/guardian-invites', 'POST', gInvite.ok ? 'WORKING' : (gInvite.httpStatus === 403 ? 'PARTIALLY_WORKING' : 'FAILED'), gInvite.httpStatus, gInvite.json?.message, gInvite.json, gInvite.ok ? 'None' : (gInvite.json?.message || 'Guardian invite failed'), gInvite.ok ? 'None' : 'Ensure caller has PARENT role assigned');

  const gInvitePending = await testEndpoint('Guardian Invites', '/relationships/guardian-invites/pending', 'GET', null, sessionHeaders);
  console.log('GET /v1/relationships/guardian-invites/pending:', gInvitePending.httpStatus, JSON.stringify(gInvitePending.json));
  recordResult('Guardian Invites', '/v1/relationships/guardian-invites/pending', 'GET', gInvitePending.ok ? 'WORKING' : 'FAILED', gInvitePending.httpStatus, gInvitePending.json?.message, gInvitePending.json, gInvitePending.ok ? 'None' : 'Pending invites lookup failed', gInvitePending.ok ? 'None' : 'Ensure pending invites query is working');

  // 6. Guardian Requests (Child -> Parent)
  console.log('\n6. Testing Guardian Requests...');
  const parentEmail = `parent_${Date.now()}@example.com`;
  const gReq = await testEndpoint('Guardian Requests', '/relationships/guardian-requests', 'POST', { parentEmail }, sessionHeaders);
  console.log('POST /v1/relationships/guardian-requests:', gReq.httpStatus, JSON.stringify(gReq.json));
  recordResult('Guardian Requests', '/v1/relationships/guardian-requests', 'POST', gReq.ok ? 'WORKING' : 'FAILED', gReq.httpStatus, gReq.json?.message, gReq.json, gReq.ok ? 'None' : (gReq.json?.message || 'Guardian request failed'), gReq.ok ? 'None' : 'Ensure guardian request endpoint works');

  const gReqPending = await testEndpoint('Guardian Requests', '/relationships/guardian-requests/pending', 'GET', null, sessionHeaders);
  console.log('GET /v1/relationships/guardian-requests/pending:', gReqPending.httpStatus, JSON.stringify(gReqPending.json));
  recordResult('Guardian Requests', '/v1/relationships/guardian-requests/pending', 'GET', gReqPending.ok ? 'WORKING' : 'FAILED', gReqPending.httpStatus, gReqPending.json?.message, gReqPending.json, gReqPending.ok ? 'None' : 'Pending requests lookup failed', gReqPending.ok ? 'None' : 'Verify guardian requests query');

  // 7. Relationships (Follow / Connections / List)
  console.log('\n7. Testing Relationships Module...');
  const relList = await testEndpoint('Relationships', '/relationships', 'GET', null, sessionHeaders);
  console.log('GET /v1/relationships:', relList.httpStatus, JSON.stringify(relList.json));
  recordResult('Relationships', '/v1/relationships', 'GET', relList.ok ? 'WORKING' : 'FAILED', relList.httpStatus, relList.json?.message, relList.json, relList.ok ? 'None' : 'Relationships list failed', relList.ok ? 'None' : 'Check relationships service');

  // 8. Feed & Posts
  console.log('\n8. Testing Feed & Posts Module...');
  const feedRes = await testEndpoint('Feed', '/feed', 'GET', null, sessionHeaders);
  console.log('GET /v1/feed:', feedRes.httpStatus, JSON.stringify(feedRes.json));
  recordResult('Feed', '/v1/feed', 'GET', feedRes.ok ? 'WORKING' : 'FAILED', feedRes.httpStatus, feedRes.json?.message, feedRes.json, feedRes.ok ? 'None' : 'Feed request failed', feedRes.ok ? 'None' : 'Verify feed generator');

  const createPostRes = await testEndpoint('Posts', '/posts', 'POST', {
    body: 'Testing post integration from API test suite',
    audience: 'PUBLIC',
  }, sessionHeaders);
  console.log('POST /v1/posts:', createPostRes.httpStatus, JSON.stringify(createPostRes.json));
  recordResult('Posts', '/v1/posts', 'POST', createPostRes.ok ? 'WORKING' : 'FAILED', createPostRes.httpStatus, createPostRes.json?.message, createPostRes.json, createPostRes.ok ? 'None' : (createPostRes.json?.message || 'Post creation failed'), createPostRes.ok ? 'None' : 'Check post creation handler');

  // 9. Groups
  console.log('\n9. Testing Groups Module...');
  const groupsRes = await testEndpoint('Groups', '/groups?scope=discover', 'GET', null, sessionHeaders);
  console.log('GET /v1/groups:', groupsRes.httpStatus, JSON.stringify(groupsRes.json));
  recordResult('Groups', '/v1/groups', 'GET', groupsRes.ok ? 'WORKING' : 'FAILED', groupsRes.httpStatus, groupsRes.json?.message, groupsRes.json, groupsRes.ok ? 'None' : 'Groups list failed', groupsRes.ok ? 'None' : 'Check groups query');

  const createGroupRes = await testEndpoint('Groups', '/groups', 'POST', {
    name: `Test Group ${Date.now()}`,
    type: 'PRIVATE',
    description: 'Test description for API audit',
  }, sessionHeaders);
  console.log('POST /v1/groups:', createGroupRes.httpStatus, JSON.stringify(createGroupRes.json));
  recordResult('Groups', '/v1/groups', 'POST', createGroupRes.ok ? 'WORKING' : 'FAILED', createGroupRes.httpStatus, createGroupRes.json?.message, createGroupRes.json, createGroupRes.ok ? 'None' : (createGroupRes.json?.message || 'Group creation failed'), createGroupRes.ok ? 'None' : 'Check group creation endpoint');

  // 10. Organizations
  console.log('\n10. Testing Organizations Module...');
  const orgsRes = await testEndpoint('Organizations', '/organizations', 'GET', null, sessionHeaders);
  console.log('GET /v1/organizations:', orgsRes.httpStatus, JSON.stringify(orgsRes.json));
  recordResult('Organizations', '/v1/organizations', 'GET', orgsRes.ok ? 'WORKING' : 'FAILED', orgsRes.httpStatus, orgsRes.json?.message, orgsRes.json, orgsRes.ok ? 'None' : 'Organizations list failed', orgsRes.ok ? 'None' : 'Check organizations query');

  // 11. Supervision
  console.log('\n11. Testing Supervision Module...');
  const supervisionRes = await testEndpoint('Supervision', '/supervision', 'GET', null, sessionHeaders);
  console.log('GET /v1/supervision:', supervisionRes.httpStatus, JSON.stringify(supervisionRes.json));
  recordResult('Supervision', '/v1/supervision', 'GET', supervisionRes.ok ? 'WORKING' : (supervisionRes.httpStatus === 403 ? 'PARTIALLY_WORKING' : 'FAILED'), supervisionRes.httpStatus, supervisionRes.json?.message, supervisionRes.json, supervisionRes.ok ? 'None' : (supervisionRes.json?.message || 'Supervision fetch requires PARENT role'), supervisionRes.ok ? 'None' : 'Verify Supervision role check for PARENT');

  const createChildRes = await testEndpoint('Supervision', '/supervision/children', 'POST', {
    displayName: 'Sam Junior',
    firstName: 'Sam',
    lastName: 'Junior',
    dateOfBirth: '2015-08-10',
    guardianRelation: 'MOTHER',
    profileVisibility: 'CONNECTIONS',
    requireApprovalAdultContact: true,
    requireApprovalConnections: true,
    requireApprovalTeamInvites: true,
    requireApprovalMedia: true,
  }, sessionHeaders);
  console.log('POST /v1/supervision/children:', createChildRes.httpStatus, JSON.stringify(createChildRes.json));
  recordResult('Supervision', '/v1/supervision/children', 'POST', createChildRes.ok ? 'WORKING' : (createChildRes.httpStatus === 403 ? 'PARTIALLY_WORKING' : 'FAILED'), createChildRes.httpStatus, createChildRes.json?.message, createChildRes.json, createChildRes.ok ? 'None' : (createChildRes.json?.message || 'Create managed child failed'), createChildRes.ok ? 'None' : 'Check managed child creation handler');

  // 12. Approvals
  console.log('\n12. Testing Approvals Module...');
  const approvalsRes = await testEndpoint('Approvals', '/approvals?status=PENDING', 'GET', null, sessionHeaders);
  console.log('GET /v1/approvals:', approvalsRes.httpStatus, JSON.stringify(approvalsRes.json));
  recordResult('Approvals', '/v1/approvals', 'GET', approvalsRes.ok ? 'WORKING' : 'FAILED', approvalsRes.httpStatus, approvalsRes.json?.message, approvalsRes.json, approvalsRes.ok ? 'None' : 'Approvals query failed', approvalsRes.ok ? 'None' : 'Verify approvals query handler');

  // 13. Alerts
  console.log('\n13. Testing Alerts Module...');
  const alertsRes = await testEndpoint('Alerts', '/alerts', 'GET', null, sessionHeaders);
  console.log('GET /v1/alerts:', alertsRes.httpStatus, JSON.stringify(alertsRes.json));
  recordResult('Alerts', '/v1/alerts', 'GET', alertsRes.ok ? 'WORKING' : 'FAILED', alertsRes.httpStatus, alertsRes.json?.message, alertsRes.json, alertsRes.ok ? 'None' : 'Alerts query failed', alertsRes.ok ? 'None' : 'Verify alerts query handler');

  const unreadAlertsRes = await testEndpoint('Alerts', '/alerts/unread-count', 'GET', null, sessionHeaders);
  console.log('GET /v1/alerts/unread-count:', unreadAlertsRes.httpStatus, JSON.stringify(unreadAlertsRes.json));
  recordResult('Alerts', '/v1/alerts/unread-count', 'GET', unreadAlertsRes.ok ? 'WORKING' : 'FAILED', unreadAlertsRes.httpStatus, unreadAlertsRes.json?.message, unreadAlertsRes.json, unreadAlertsRes.ok ? 'None' : 'Unread alert count failed', unreadAlertsRes.ok ? 'None' : 'Verify alert count handler');

  console.log('\n=== API INTEGRATION TEST SUMMARY RESULTS ===');
  console.table(results.map(r => ({
    Module: r.module,
    Endpoint: r.endpoint,
    Method: r.method,
    Status: r.status,
    HTTP: r.statusCode,
    Message: r.message || 'OK',
    MissingData_Issue: r.missingOrIssue,
  })));

  return results;
}

runAllTests();
