<?php
// CORS headers para desarrollo
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php';
$mysqli = get_mysqli();

$data = json_decode(file_get_contents('php://input'), true);
$nombre = isset($data['nombre']) ? trim($data['nombre']) : '';
$actividad_id = isset($data['actividad_id']) ? intval($data['actividad_id']) : 0;

if (!$nombre || !$actividad_id) {
    echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
    exit;
}


$stmt = $mysqli->prepare('INSERT INTO presupuesto (nombre, actividades_id) VALUES (?, ?)');
if (!$stmt) {
    echo json_encode(['success' => false, 'error' => 'Error en prepare: ' . $mysqli->error]);
    exit;
}
$stmt->bind_param('si', $nombre, $actividad_id);
$ok = $stmt->execute();

if ($ok) {
    $id = $mysqli->insert_id;
    echo json_encode([
        'success' => true,
        'presupuesto' => [
            'id' => $id,
            'nombre' => $nombre,
            'actividad_id' => $actividad_id
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'error' => 'Error al crear presupuesto: ' . $stmt->error]);
}
$stmt->close();
$mysqli->close();
