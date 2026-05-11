<?php
/* ════════════════════════════════════════════
   AUTOPARTS MX — geoip.php
   Proxy PHP para IP Geolocation
   Respaldo cuando ip-api.com no responde desde JS
════════════════════════════════════════════ */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
error_reporting(0);

// Obtener la IP real del visitante
$ip = $_SERVER['HTTP_X_FORWARDED_FOR']
    ?? $_SERVER['HTTP_X_REAL_IP']
    ?? $_SERVER['REMOTE_ADDR']
    ?? '';

// Limpiar si hay múltiples IPs (proxy)
if (strpos($ip, ',') !== false) {
    $ip = trim(explode(',', $ip)[0]);
}

// Llamar a ip-api.com desde el servidor PHP (no tiene restricción de protocolo)
$url  = "http://ip-api.com/json/{$ip}?lang=es&fields=status,city,regionName,country,lat,lon,isp,query";
$data = @file_get_contents($url);

if ($data === false) {
    // Segundo intento con curl
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        $data = curl_exec($ch);
        curl_close($ch);
    }
}

if ($data) {
    echo $data;
} else {
    http_response_code(503);
    echo json_encode(['status' => 'fail', 'message' => 'No se pudo obtener geolocalización']);
}
exit;
?>
