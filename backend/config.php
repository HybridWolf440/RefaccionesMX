<?php
$host = 'fdb1034.awardspace.net';
$port = '3306';
$dbname = '4667291_autopartsmx';
$username = '4667291_autopartsmx';
$password = '*^:Ym_#]2Fd4.iRT';

try {
    $pdo = new PDO(
        "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos.', 'debug' => $e->getMessage()]);
    exit;
}
?>
