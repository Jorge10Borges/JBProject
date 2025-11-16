<?php
// presupuesto_update.php
header('Content-Type: application/json');
require_once 'db.php';

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

$stmt = $pdo->prepare('UPDATE presupuesto SET estado = ? WHERE id = ?');
if ($stmt->execute([$estado, $id])) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Error en la base de datos']);
}
