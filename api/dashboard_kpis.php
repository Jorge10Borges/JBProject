
<?php
// dashboard_kpis.php

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
require_once 'config.php';

$presupuesto_id = isset($_GET['presupuesto_id']) ? intval($_GET['presupuesto_id']) : 0;
if (!$presupuesto_id) {
    echo json_encode(["error" => "ID de presupuesto inválido"]);
    exit;
}

$conn = get_mysqli();

// Presupuesto total

$stmt = $conn->prepare("SELECT monto, ejecutado, avance, anticipo, estado, updated_at FROM presupuesto WHERE id = ? LIMIT 1");
$stmt->bind_param('i', $presupuesto_id);
$stmt->execute();
$result = $stmt->get_result();
$presupuesto = $result->fetch_assoc();
$stmt->close();
if (!$presupuesto) {
    echo json_encode(["error" => "Presupuesto no encontrado"]);
    $conn->close();
    exit;
}

// Anticipo (si existe tabla o lógica relacionada, aquí iría la consulta)
// Si solo se usa el campo de la tabla presupuesto, no es necesario consultar otra tabla.
$anticipos = null;
$cant_anticipos = null;

// Valuaciones (por ahora siempre cero hasta que se implemente el módulo)
$valuaciones = 0;

// KPIs

$presupuesto_total = floatval($presupuesto['monto']);
$monto_ejecutado = floatval($presupuesto['ejecutado']);
$saldo_disponible = $presupuesto_total - $monto_ejecutado;
$avance = floatval($presupuesto['avance']);

$anticipo = floatval($presupuesto['anticipo']);
$anticipo_pct = ($presupuesto_total > 0) ? round(($anticipo / $presupuesto_total) * 100, 2) : 0;

// Última actualización
$ultima_actualizacion = $presupuesto['updated_at'];

// Estado
$estado = $presupuesto['estado'];

// Respuesta
$response = [
    "presupuesto_total" => number_format($presupuesto_total, 2, ',', '.'),
    "monto_ejecutado" => number_format($monto_ejecutado, 2, ',', '.'),
    "saldo_disponible" => number_format($saldo_disponible, 2, ',', '.'),
    "avance_financiero" => $avance,
    "anticipo" => number_format($anticipo, 2, ',', '.'),
    "anticipo_pct" => $anticipo_pct,
    "valuaciones" => $valuaciones,
    "ultima_actualizacion" => $ultima_actualizacion,
    "estado" => ucfirst($estado)
];

$conn->close();
echo json_encode($response);