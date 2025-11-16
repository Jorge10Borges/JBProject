
<?php
require_once __DIR__ . '/config.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$presupuesto_id = isset($_GET['presupuesto_id']) ? intval($_GET['presupuesto_id']) : null;
if (!$presupuesto_id) {
  echo json_encode([]);
  exit;
}

$mysqli = get_mysqli();
$sql = "SELECT id, descripcion, unidad, cantidad, precio FROM presupuesto_detalle WHERE presupuesto_id = ?";
$stmt = $mysqli->prepare($sql);
$stmt->bind_param('i', $presupuesto_id);
$stmt->execute();
$result = $stmt->get_result();
$items = [];
while ($row = $result->fetch_assoc()) {
  $items[] = $row;
}
$stmt->close();
$mysqli->close();
echo json_encode($items);
