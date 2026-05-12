// db.js
const sql = require('mssql');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT),
  options: {
    trustServerCertificate: true,
  },
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

poolConnect
  .then(() => console.log('SQL Connected'))
  .catch((err) => console.error('SQL Connection failed:', err));

module.exports = { pool, poolConnect, sql };