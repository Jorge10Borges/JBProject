// Script de prueba de conexión MySQL
// Usa las variables definidas en .env (prefijo VITE_DB_*)
// Ejecutar: npm run db:test

require('dotenv').config();
const mysql = require('mysql2/promise');

function env(key, fallback) {
  return process.env[key] || fallback;
}

const config = {
  host: env('VITE_DB_HOST', 'localhost'),
  port: Number(env('VITE_DB_PORT', 3306)),
  user: env('VITE_DB_USER', ''),
  password: env('VITE_DB_PASS', ''),
  database: env('VITE_DB_NAME', ''),
  connectTimeout: 8000,
};

(async () => {
  console.log('Probando conexión MySQL...');
  console.log(`Host: ${config.host}:${config.port}`);
  console.log(`Usuario: ${config.user}`);
  console.log('Si falla conexión verifica: IP accesible, firewall, usuario/privilegios, bind-address en MySQL.');
  try {
    const conn = await mysql.createConnection(config);
    const [rows] = await conn.query('SELECT 1 AS ok');
    console.log('Conexión exitosa. Resultado test:', rows);
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('Error de conexión:', err.message);
    // Mostrar código de error si existe
    if (err.code) console.error('Código:', err.code);
    process.exit(1);
  }
})();
