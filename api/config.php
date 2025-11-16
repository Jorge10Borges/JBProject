<?php
// Configuración global para endpoints PHP

// Variables de entorno
$ENV = [
  // Cambia a 'production' en el hosting
  'APP_ENV' => 'development',
  'API_BASE' => 'http://192.168.0.200/JBProject/api/',
  // Configuración de base de datos
  'DB_HOST' => '192.168.0.200',
  'DB_PORT' => '3306',
  'DB_NAME' => 'jbproject',
  'DB_USER' => 'jorge10borges',
  'DB_PASS' => 'Ve*11818946',
  'DB_CHARSET' => 'utf8mb4',
];

// Función para obtener variable de entorno
function env($key, $default = null) {
  global $ENV;
  return isset($ENV[$key]) ? $ENV[$key] : $default;
}




// Función para obtener conexión MySQLi
function get_mysqli() {
  $host = env('DB_HOST');
  $port = env('DB_PORT', '3306');
  $db   = env('DB_NAME');
  $user = env('DB_USER');
  $pass = env('DB_PASS');
  $mysqli = new mysqli($host, $user, $pass, $db, (int)$port);
  if ($mysqli->connect_errno) {
    http_response_code(500);
    echo json_encode(['error' => 'MySQLi Connection failed', 'details' => $mysqli->connect_error]);
    exit;
  }
  $mysqli->set_charset(env('DB_CHARSET', 'utf8mb4'));
  return $mysqli;
}
