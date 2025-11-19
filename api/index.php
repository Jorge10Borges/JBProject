<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

echo json_encode([
  'status' => 'ok',
  'service' => 'JBProject API',
  'time' => date('c')
]);
