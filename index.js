const { Pool } = require('pg');

// Create a connection pool
const pool = new Pool({
  user: 'postgres',        
  host: 'localhost',       
  database: 'assignment', 
  password: 'root',     
  port: 5432,              
});


async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database successfully!');
    
    const result = await client.query('SELECT NOW()');
    console.log('📅 Current database time:', result.rows[0].now);
    
    client.release();
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

testConnection();
