<?php
// api/guardar_anticipo.php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

$presupuesto_id = isset($_POST['presupuesto_id']) ? intval($_POST['presupuesto_id']) : 0;
$monto = isset($_POST['anticipo']) ? floatval($_POST['anticipo']) : 0;
$fecha = isset($_POST['fechaAnticipo']) ? $_POST['fechaAnticipo'] : null;

if (!$presupuesto_id || !$monto || !$fecha) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos incompletos']);
    exit;
}

$conn = get_mysqli();

// Actualizar el campo anticipo en la tabla presupuesto
$stmt = $conn->prepare("UPDATE presupuesto SET anticipo = ?, updated_at = NOW() WHERE id = ?");
$stmt->bind_param('di', $monto, $presupuesto_id);
$ok = $stmt->execute();
$stmt->close();

if (!$ok) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo guardar el anticipo']);
    $conn->close();
    exit;
}

// Opcional: guardar fecha y comprobante en otra tabla si lo deseas
// Por ahora solo se actualiza el campo anticipo

$conn->close();
echo json_encode(['success' => true]);
