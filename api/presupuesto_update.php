
<?php
// presupuesto_update.php
// Permitir CORS para desarrollo local
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

// Manejar preflight (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['id']) || !isset($data['estado'])) {
    echo json_encode(['success' => false, 'error' => 'Faltan parámetros']);
    exit;
}

$id = intval($data['id']);
$estado = $data['estado'];
$estadosValidos = ['pendiente', 'aprobado', 'culminado'];
if (!in_array($estado, $estadosValidos)) {
    echo json_encode(['success' => false, 'error' => 'Estado inválido']);
    exit;
}

$mysqli = get_mysqli();

// Si el estado es 'aprobado', también actualiza monto y updated_at
if ($estado === 'aprobado') {
    // Calcular el monto sumando los subtotales de los items
    $sqlMonto = "SELECT SUM(cantidad * precio) AS total FROM presupuesto_detalle WHERE presupuesto_id = ?";
    $stmtMonto = $mysqli->prepare($sqlMonto);
    $stmtMonto->bind_param('i', $id);
    $stmtMonto->execute();
    $resMonto = $stmtMonto->get_result();
    $rowMonto = $resMonto->fetch_assoc();
    $monto = $rowMonto ? floatval($rowMonto['total']) : 0;
    $stmtMonto->close();

    $stmt = $mysqli->prepare('UPDATE presupuesto SET estado = ?, monto = ?, updated_at = NOW() WHERE id = ?');
    if ($stmt) {
        $stmt->bind_param('sdi', $estado, $monto, $id);
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Error en la base de datos', 'details' => $stmt->error]);
        }
        $stmt->close();
    } else {
        echo json_encode(['success' => false, 'error' => 'Error preparando la consulta', 'details' => $mysqli->error]);
    }
} else {
    $stmt = $mysqli->prepare('UPDATE presupuesto SET estado = ? WHERE id = ?');
    if ($stmt) {
        $stmt->bind_param('si', $estado, $id);
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Error en la base de datos', 'details' => $stmt->error]);
        }
        $stmt->close();
    } else {
        echo json_encode(['success' => false, 'error' => 'Error preparando la consulta', 'details' => $mysqli->error]);
    }
}
$mysqli->close();
