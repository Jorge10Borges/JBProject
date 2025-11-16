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

$presupuesto_id = isset($data['presupuesto_id']) ? intval($data['presupuesto_id']) : 0; // id del presupuesto
$descripcion = isset($data['descripcion']) ? trim((string)$data['descripcion']) : '';
$unidad = isset($data['unidad']) ? trim((string)$data['unidad']) : 'UND';
$cantidad = isset($data['cantidad']) ? floatval($data['cantidad']) : null;
$precio = isset($data['precio']) ? floatval($data['precio']) : null;

if (!$presupuesto_id || $descripcion === '' || $unidad === '' || $cantidad === null || $precio === null) {
  http_response_code(400);
  echo json_encode(['error' => 'Parámetros inválidos']);
  exit;
}

$mysqli = get_mysqli();

$sql = 'INSERT INTO presupuesto_detalle (presupuesto_id, descripcion, unidad, cantidad, precio) VALUES (?, ?, ?, ?, ?)';
$stmt = $mysqli->prepare($sql);
if (!$stmt) {
  http_response_code(500);
  echo json_encode(['error' => 'DB prepare failed']);
  exit;
}
$stmt->bind_param('issdd', $presupuesto_id, $descripcion, $unidad, $cantidad, $precio);
$ok = $stmt->execute();

if (!$ok) {
  http_response_code(500);
  echo json_encode(['error' => 'DB insert failed']);
  $stmt->close();
  $mysqli->close();
  exit;
}

$new_id = $stmt->insert_id;
$stmt->close();

$select = $mysqli->prepare('SELECT id, descripcion, unidad, cantidad, precio FROM presupuesto_detalle WHERE id = ?');
$select->bind_param('i', $new_id);
$select->execute();
$result = $select->get_result();
$row = $result->fetch_assoc();
$select->close();
$mysqli->close();

echo json_encode(['success' => true, 'item' => $row]);
