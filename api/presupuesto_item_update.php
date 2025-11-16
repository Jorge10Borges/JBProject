<?php
require_once __DIR__ . '/config.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method Not Allowed']);
  exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

$id = isset($data['id']) ? intval($data['id']) : 0;
$cantidad = array_key_exists('cantidad', $data) ? floatval($data['cantidad']) : null;
$precio = array_key_exists('precio', $data) ? floatval($data['precio']) : null;
$descripcion = array_key_exists('descripcion', $data) ? trim((string)$data['descripcion']) : null;
$unidad = array_key_exists('unidad', $data) ? trim((string)$data['unidad']) : null;

if (!$id) {
  http_response_code(400);
  echo json_encode(['error' => 'ID inválido']);
  exit;
}

// Construir SQL dinámico según campos presentes
$fields = [];
$params = [];
$types = '';
if ($descripcion !== null) { $fields[] = 'descripcion = ?'; $params[] = $descripcion; $types .= 's'; }
if ($unidad !== null)      { $fields[] = 'unidad = ?';      $params[] = $unidad;      $types .= 's'; }
if ($cantidad !== null)    { $fields[] = 'cantidad = ?';    $params[] = $cantidad;    $types .= 'd'; }
if ($precio !== null)      { $fields[] = 'precio = ?';      $params[] = $precio;      $types .= 'd'; }

if (empty($fields)) {
  http_response_code(400);
  echo json_encode(['error' => 'Sin campos para actualizar']);
  exit;
}

$mysqli = get_mysqli();
$sql = 'UPDATE presupuesto_detalle SET ' . implode(', ', $fields) . ' WHERE id = ?';
$stmt = $mysqli->prepare($sql);
if (!$stmt) {
  http_response_code(500);
  echo json_encode(['error' => 'DB prepare failed']);
  exit;
}

// Bind dinámico
$types .= 'i';
$params[] = $id;
$bind = [];
$bind[] = & $types;
for ($i = 0; $i < count($params); $i++) {
  $bind[] = & $params[$i];
}
call_user_func_array([$stmt, 'bind_param'], $bind);

$ok = $stmt->execute();
if (!$ok) {
  http_response_code(500);
  echo json_encode(['error' => 'DB update failed']);
  $stmt->close();
  $mysqli->close();
  exit;
}
$stmt->close();

// Devolver el registro actualizado
$select = $mysqli->prepare('SELECT id, descripcion, unidad, cantidad, precio FROM presupuesto_detalle WHERE id = ?');
$select->bind_param('i', $id);
$select->execute();
$result = $select->get_result();
$row = $result->fetch_assoc();
$select->close();
$mysqli->close();

echo json_encode(['success' => true, 'item' => $row]);
