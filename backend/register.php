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

$nombre = trim($raw['nombre'] ?? '');
$username = trim($raw['username'] ?? '');
$email = trim($raw['email'] ?? '');
$password = $raw['password'] ?? '';
$confirmPassword = $raw['confirmPassword'] ?? '';

if ($nombre === '' || $username === '' || $email === '' || $password === '' || $confirmPassword === '') {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Completa todos los campos.'
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Correo electrónico no válido.'
    ]);
    exit;
}

if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'La contraseña debe tener al menos 8 caracteres.'
    ]);
    exit;
}

if ($password !== $confirmPassword) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Las contraseñas no coinciden.'
    ]);
    exit;
}

try {
    $check = $pdo->prepare("SELECT id FROM usuarios WHERE email = ? OR username = ? LIMIT 1");
    $check->execute([$email, $username]);

    if ($check->fetch()) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'El correo o nombre de usuario ya está registrado.'
        ]);
        exit;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, username, email, password) VALUES (?, ?, ?, ?)");
    $stmt->execute([$nombre, $username, $email, $hash]);

    $userId = $pdo->lastInsertId();

    $_SESSION['user_id'] = $userId;
    $_SESSION['username'] = $username;
    $_SESSION['nombre'] = $nombre;
    $_SESSION['email'] = $email;

    echo json_encode([
        'success' => true,
        'message' => 'Cuenta creada correctamente.',
        'user' => [
            'id' => $userId,
            'nombre' => $nombre,
            'username' => $username,
            'email' => $email
        ]
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error interno al crear la cuenta.'
    ]);
}
?>