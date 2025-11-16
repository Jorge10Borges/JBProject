<?php
require_once __DIR__ . '/config.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');


$mysqli = get_mysqli();
if (isset($_GET['project_id'])) {
  $project_id = intval($_GET['project_id']);
  $sql = "SELECT p.id, p.nombre, p.monto, p.ejecutado, p.avance, p.actividades_id
    FROM presupuesto p
    INNER JOIN actividades a ON p.actividades_id = a.id
    WHERE a.project_id = ?";
  $stmt = $mysqli->prepare($sql);
  $stmt->bind_param('i', $project_id);
  $stmt->execute();
  $result = $stmt->get_result();
  $items = [];
  while ($row = $result->fetch_assoc()) {
    $items[] = $row;
  }
  $stmt->close();
} else {
  $sql = "SELECT p.id, p.nombre, p.monto, p.ejecutado, p.avance, p.actividades_id FROM presupuesto p";
  $result = $mysqli->query($sql);
  $items = [];
  if ($result) {
    while ($row = $result->fetch_assoc()) {
      $items[] = $row;
    }
    $result->free();
  }
}
$mysqli->close();
echo json_encode($items);
