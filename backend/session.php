<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

echo json_encode([
    'authenticated' => isset($_SESSION['user_id']),
    'user' => isset($_SESSION['user_id']) ? [
        'id' => $_SESSION['user_id'],
        'nombre' => $_SESSION['nombre'] ?? '',
        'username' => $_SESSION['username'] ?? '',
        'email' => $_SESSION['email'] ?? ''
    ] : null
]);
?>