
<?php
require_once __DIR__ . '/config.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$mysqli = get_mysqli();
$sql = "SELECT id, project_code, name, status, start_date, end_date, budget, currency, client_name FROM projects";
$result = $mysqli->query($sql);
$projects = [];
if ($result) {
  while ($row = $result->fetch_assoc()) {
    $projects[] = $row;
  }
  $result->free();
}
$mysqli->close();
echo json_encode($projects);
