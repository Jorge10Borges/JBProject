<?php
require_once __DIR__ . '/config.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$id = isset($_GET['id']) ? intval($_GET['id']) : null;
if (!$id) {
  http_response_code(400);
  echo json_encode(['error' => 'ID de actividad requerido']);
  exit;
}

$mysqli = get_mysqli();
$sql = "SELECT id, nombre, project_id FROM actividades WHERE id = ? LIMIT 1";
$stmt = $mysqli->prepare($sql);
$stmt->bind_param('i', $id);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$stmt->close();
$mysqli->close();

if ($row) {
  echo json_encode($row);
} else {
  http_response_code(404);
  echo json_encode(['error' => 'Actividad no encontrada']);
}
