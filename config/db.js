const { Pool } = require('pg');
const pool = new Pool({
	user: 'myuser',
	host: 'localhost',
	database: 'mydb',
	password: '08092002',
	port: 5432,
});
module.exports = pool;

