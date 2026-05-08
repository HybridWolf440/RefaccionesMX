<?php
header('Content-Type: application/json; charset=utf-8');
session_start();
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido.'
    ]);
    exit;
}

$raw = json_decode(file_get_contents('php://input'), true);

if (!is_array($raw)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Datos inválidos.'
    ]);
    exit;
}

$login = trim($raw['login'] ?? '');
$password = $raw['password'] ?? '';

if ($login === '' || $password === '') {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Completa usuario/correo y contraseña.'
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, nombre, username, email, password FROM usuarios WHERE email = ? OR username = ? LIMIT 1");
    $stmt->execute([$login, $login]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Credenciales incorrectas.'
        ]);
        exit;
    }

    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['nombre'] = $user['nombre'];
    $_SESSION['email'] = $user['email'];

    echo json_encode([
        'success' => true,
        'message' => 'Inicio de sesión correcto.',
        'user' => [
            'id' => $user['id'],
            'nombre' => $user['nombre'],
            'username' => $user['username'],
            'email' => $user['email']
        ]
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error interno al iniciar sesión.'
    ]);
}
?>