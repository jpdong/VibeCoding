const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// 从环境变量获取数据库连接信息
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('开始创建数据库表...');
    
    // 获取所有SQL文件并按名称排序
    const sqlDir = path.join(__dirname, '../sql');
    const sqlFiles = fs.readdirSync(sqlDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    // 按顺序执行每个SQL文件
    for (const file of sqlFiles) {
      const filePath = path.join(sqlDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`执行: ${file}`);
      
      try {
        await client.query(sql);
        console.log(`✅ ${file} 执行成功`);
      } catch (error) {
        console.error(`❌ ${file} 执行失败:`, error.message);
        throw error;
      }
    }
    
    console.log('🎉 所有数据库表创建完成！');
    
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// 运行初始化
initDatabase();