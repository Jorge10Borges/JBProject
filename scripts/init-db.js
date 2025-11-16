// Ejecuta scripts/init-db.sql para crear/actualizar tablas
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

function env(key, fallback) {
  return process.env[key] || fallback;
}

async function main() {
  const sqlFile = path.resolve(__dirname, 'init-db.sql');
  if (!fs.existsSync(sqlFile)) {
    console.error('Archivo init-db.sql no encontrado');
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlFile, 'utf8');

  const connection = await mysql.createConnection({
    host: env('VITE_DB_HOST', 'localhost'),
    port: Number(env('VITE_DB_PORT', 3306)),
    user: env('VITE_DB_USER', ''),
    password: env('VITE_DB_PASS', ''),
    database: env('VITE_DB_NAME', ''),
    multipleStatements: true,
  });

  try {
    console.log('Ejecutando init-db.sql ...');
    await connection.query(sql);
    console.log('Inicialización completada.');
  } catch (err) {
    console.error('Error durante inicialización:', err.message);
    if (err.code) console.error('Código:', err.code);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
}

main();
