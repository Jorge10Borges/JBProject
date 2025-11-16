<?php
require_once __DIR__ . '/config.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Permite obtener un presupuesto por su ID
$presupuesto_id = isset($_GET['id']) ? intval($_GET['id']) : null;
if (!$presupuesto_id) {
  http_response_code(400);
  echo json_encode(['error' => 'ID de presupuesto requerido']);
  exit;
}

$mysqli = get_mysqli();
$sql = "SELECT p.id, p.nombre, p.monto, p.ejecutado, p.avance, p.actividades_id, p.estado FROM presupuesto p WHERE p.id = ? LIMIT 1";
$stmt = $mysqli->prepare($sql);
$stmt->bind_param('i', $presupuesto_id);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$stmt->close();
$mysqli->close();

if ($row) {
  echo json_encode($row);
} else {
  http_response_code(404);
  echo json_encode(['error' => 'Presupuesto no encontrado']);
}
