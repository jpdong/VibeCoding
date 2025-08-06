const { Pool } = require('pg');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testSystem() {
  console.log('🧪 Starting system integration tests...\n');

  // Test 1: Database Connection
  console.log('1. Testing database connection...');
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    await pool.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }

  // Test 2: Environment Variables
  console.log('\n2. Testing environment variables...');
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'TURNSTILE_SECRET_KEY',
    'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
    'OPENAI_API_KEY'
  ];

  let envVarsOk = true;
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ Missing environment variable: ${envVar}`);
      envVarsOk = false;
    } else {
      console.log(`✅ ${envVar} is configured`);
    }
  }

  if (!envVarsOk) {
    console.error('\n❌ Some environment variables are missing');
    return false;
  }

  // Test 3: Database Tables
  console.log('\n3. Testing database tables...');
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    const tables = ['users', 'subscriptions', 'models', 'sessions'];
    for (const table of tables) {
      const result = await pool.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`✅ Table '${table}' exists with ${result.rows[0].count} records`);
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Database table check failed:', error.message);
    return false;
  }

  // Test 4: Models Data
  console.log('\n4. Testing models data...');
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    const result = await pool.query('SELECT id, name, tier, available FROM models ORDER BY sort_order');
    if (result.rows.length === 0) {
      console.error('❌ No models found in database');
      return false;
    }

    console.log('✅ Available models:');
    result.rows.forEach(model => {
      console.log(`   - ${model.name} (${model.tier}) ${model.available ? '✓' : '✗'}`);
    });

    await pool.end();
  } catch (error) {
    console.error('❌ Models data check failed:', error.message);
    return false;
  }

  // Test 5: API Endpoints (if server is running)
  console.log('\n5. Testing API endpoints...');
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // Test models endpoint
    const modelsResponse = await fetch(`${baseUrl}/api/models`);
    if (modelsResponse.ok) {
      const modelsData = await modelsResponse.json();
      console.log(`✅ Models API working (${modelsData.models?.length || 0} models)`);
    } else {
      console.log('⚠️  Models API not accessible (server may not be running)');
    }

    // Test session endpoint
    const sessionResponse = await fetch(`${baseUrl}/api/auth/session`);
    if (sessionResponse.ok) {
      console.log('✅ Session API working');
    } else {
      console.log('⚠️  Session API not accessible (server may not be running)');
    }
  } catch (error) {
    console.log('⚠️  API endpoints not accessible (server may not be running)');
  }

  console.log('\n🎉 System integration tests completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Run `npm run dev` to start the development server');
  console.log('2. Visit http://localhost:3000 to test the application');
  console.log('3. Test Google login functionality');
  console.log('4. Test model selection and chat functionality');
  console.log('5. Test pricing page and subscription modals');

  return true;
}

// Run tests
testSystem()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 System test failed:', error);
    process.exit(1);
  });