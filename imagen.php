<?php
// imagen.php — respaldo PHP para servir imágenes de productos
// Uso principal: img/productos/{id}.jpg (ruta estática directa en api.js)

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($id < 1 || $id > 200) {
    http_response_code(404);
    exit;
}

$archivo = __DIR__ . "/img/productos/{$id}.jpg";

if (!file_exists($archivo)) {
    http_response_code(404);
    exit;
}

// Limpiar cualquier output buffer antes de enviar la imagen
while (ob_get_level()) ob_end_clean();

header('Content-Type: image/jpeg');
header('Content-Length: ' . filesize($archivo));
header('Cache-Control: public, max-age=604800');
header('X-Content-Type-Options: nosniff');
readfile($archivo);
exit;
?>
