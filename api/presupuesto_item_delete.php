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
if (!$id) {
  http_response_code(400);
  echo json_encode(['error' => 'ID inválido']);
  exit;
}

$mysqli = get_mysqli();
$sql = 'DELETE FROM presupuesto_detalle WHERE id = ?';
$stmt = $mysqli->prepare($sql);
if (!$stmt) {
  http_response_code(500);
  echo json_encode(['error' => 'DB prepare failed']);
  exit;
}
$stmt->bind_param('i', $id);
$ok = $stmt->execute();
if (!$ok) {
  http_response_code(500);
  echo json_encode(['error' => 'DB delete failed']);
  $stmt->close();
  $mysqli->close();
  exit;
}
$affected = $stmt->affected_rows;
$stmt->close();
$mysqli->close();

if ($affected === 0) {
  // No existía
  echo json_encode(['success' => true, 'deleted' => false, 'id' => $id]);
} else {
  echo json_encode(['success' => true, 'deleted' => true, 'id' => $id]);
}
