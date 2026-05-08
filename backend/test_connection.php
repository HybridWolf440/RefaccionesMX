<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/config.php';

try {
    $stmt = $pdo->query("SELECT COUNT(*) AS total FROM usuarios");
    $row = $stmt->fetch();
    echo json_encode([
        'success' => true,
        'message' => 'Conexión correcta.',
        'total_usuarios' => (int)$row['total']
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al probar conexión.', 'debug' => $e->getMessage()]);
}
?>
