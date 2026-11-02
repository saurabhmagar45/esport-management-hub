const BACKEND_URL = 'https://esport-management-hub.onrender.com';
const FRONTEND_URL = 'https://esportsgg.vercel.app';

async function runTests() {
  console.log('==================================================');
  console.log('🚀 RUNNING COMPREHENSIVE SYSTEM INTEGRATION TESTS');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`⏳ Testing: ${name}... `);
      await fn();
      console.log('✅ PASSED');
      passed++;
    } catch (err) {
      console.log('❌ FAILED:', err.message);
      failed++;
    }
  }

  // TEST 1: Backend Health
  await test('Backend Health (/health)', async () => {
    const res = await fetch(`${BACKEND_URL}/health`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== 'OK') throw new Error(`Expected status OK, got ${data.status}`);
  });

  // TEST 2: Master Admin Login
  let adminToken = '';
  await test('Master Admin Login (admin@esporthub.gg)', async () => {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@esporthub.gg', password: 'password123' })
    });
    const data = await res.json();
    if (!data.success || data.user?.role !== 'admin') {
      throw new Error(data.message || 'Admin login failed');
    }
    adminToken = data.token;
  });

  // TEST 3: User Registration API
  const testEmail = `test_player_${Date.now()}@example.com`;
  const testPassword = 'Password#2026';
  let playerToken = '';
  await test('New Player Registration API', async () => {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Gamer Pro',
        email: testEmail,
        password: testPassword,
        role: 'player',
        inGameName: 'ProGamerX',
        gameId: '84920481'
      })
    });
    const data = await res.json();
    if (!data.success || !data.token) {
      throw new Error(data.message || 'Registration failed');
    }
    playerToken = data.token;
  });

  // TEST 4: New Player Login
  await test('New Player Login Authentication', async () => {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    const data = await res.json();
    if (!data.success || data.user?.email !== testEmail) {
      throw new Error(data.message || 'Player login failed');
    }
  });

  // TEST 5: Authenticated Route (/auth/me)
  await test('Authenticated User Profile (/auth/me)', async () => {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${playerToken}` }
    });
    const data = await res.json();
    if (!data.success || data.user?.email !== testEmail) {
      throw new Error('Could not fetch authenticated profile');
    }
  });

  // TEST 6: Tournaments API Endpoint
  await test('Tournaments List API (/tournaments)', async () => {
    const res = await fetch(`${BACKEND_URL}/api/v1/tournaments`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.tournaments)) {
      throw new Error('Tournaments list invalid');
    }
  });

  // TEST 7: Frontend Root Status & SPA Rewrite
  await test('Frontend Vercel Root & Direct Route Handling (200 OK)', async () => {
    const routes = ['/', '/login', '/register', '/tournaments', '/admin'];
    for (const r of routes) {
      const res = await fetch(`${FRONTEND_URL}${r}`);
      if (res.status !== 200) {
        throw new Error(`Route ${r} returned HTTP ${res.status}`);
      }
    }
  });

  // TEST 8: Live Frontend Production Bundle Verification
  await test('Frontend Production Bundle contains Live Backend & Features', async () => {
    const htmlRes = await fetch(FRONTEND_URL);
    const html = await htmlRes.text();
    const scriptMatch = html.match(/\/assets\/index-[a-zA-Z0-9_\-]+\.js/);
    if (!scriptMatch) throw new Error('Main JS script tag not found in HTML');

    const bundleRes = await fetch(`${FRONTEND_URL}${scriptMatch[0]}`);
    const bundleJs = await bundleRes.text();

    if (!bundleJs.includes('https://esport-management-hub.onrender.com/api/v1')) {
      throw new Error('Production bundle does not point to live Render backend');
    }
    if (!bundleJs.includes('Update Room ID & Password') && !bundleJs.includes('Publish Room ID & Pass')) {
      throw new Error('Room ID & Password modal code not found in bundle');
    }
    if (!bundleJs.includes('Organizer Authority Required')) {
      throw new Error('Organizer/Admin role protection not found in bundle');
    }
  });

  console.log('\n==================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
