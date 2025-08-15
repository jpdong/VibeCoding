const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Database configuration using POSTGRES_URL
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Initializing payment system database...');
    
    // SQL files to execute in order
    const sqlFiles = [
      '3_subscription_plans.sql',
      '4_user_subscriptions.sql', 
      '5_daily_usage.sql',
      '6_payment_records.sql'
    ];
    
    for (const sqlFile of sqlFiles) {
      const sqlPath = path.join(__dirname, '..', 'sql', sqlFile);
      
      if (!fs.existsSync(sqlPath)) {
        console.log(`⚠️  Warning: ${sqlFile} not found, skipping...`);
        continue;
      }
      
      const sql = fs.readFileSync(sqlPath, 'utf8');
      
      console.log(`📄 Executing ${sqlFile}...`);
      await client.query(sql);
      console.log(`✅ ${sqlFile} executed successfully`);
    }
    
    // Add new columns to existing user_info table
    console.log('📄 Adding new columns to user_info table...');
    try {
      // 检查列是否存在
      const columnCheck = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'user_info' AND column_name IN ('current_plan', 'subscription_status')
      `);
      
      const existingColumns = columnCheck.rows.map(row => row.column_name);
      
      if (!existingColumns.includes('current_plan')) {
        await client.query(`ALTER TABLE user_info ADD COLUMN current_plan varchar DEFAULT 'free' NOT NULL`);
        console.log('✅ Added current_plan column');
      }
      
      if (!existingColumns.includes('subscription_status')) {
        await client.query(`ALTER TABLE user_info ADD COLUMN subscription_status varchar(20) DEFAULT 'active' NOT NULL`);
        console.log('✅ Added subscription_status column');
      }
      
      if (existingColumns.length === 2) {
        console.log('ℹ️  All columns already exist, skipping...');
      }
    } catch (error) {
      console.error('⚠️  Error updating user_info table:', error.message);
    }
    
    console.log('🎉 Payment system database initialization completed!');
    console.log('\n📊 Database structure:');
    console.log('- subscription_plans: Available subscription plans');
    console.log('- user_subscriptions: User subscription records');
    console.log('- daily_usage: Daily usage tracking');
    console.log('- payment_records: Payment transaction history');
    console.log('- user_info: Enhanced with subscription fields');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

// Run the initialization
initializeDatabase().catch(console.error);