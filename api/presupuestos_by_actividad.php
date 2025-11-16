<?php
require_once __DIR__ . '/config.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$actividad_id = isset($_GET['actividad_id']) ? intval($_GET['actividad_id']) : null;
if (!$actividad_id) {
  http_response_code(400);
  echo json_encode(['error' => 'actividad_id requerido']);
  exit;
}

$mysqli = get_mysqli();
$sql = "SELECT id, nombre, monto, ejecutado, avance, actividades_id FROM presupuesto WHERE actividades_id = ?";
$stmt = $mysqli->prepare($sql);
$stmt->bind_param('i', $actividad_id);
$stmt->execute();
$result = $stmt->get_result();
$items = [];
while ($row = $result->fetch_assoc()) {
  $items[] = $row;
}
$stmt->close();
$mysqli->close();
echo json_encode($items);
