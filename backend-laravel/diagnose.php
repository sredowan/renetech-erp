<?php

header('Content-Type: text/plain; charset=UTF-8');

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$baseUrl = $scheme.'://'.$host;

echo "=== PRODUCTION ROUTING DIAGNOSTIC ===".PHP_EOL;
echo "Host: {$host}".PHP_EOL;
echo "Document root: ".($_SERVER['DOCUMENT_ROOT'] ?? 'unknown').PHP_EOL;
echo "Script: ".($_SERVER['SCRIPT_NAME'] ?? 'unknown').PHP_EOL.PHP_EOL;

echo "This production check does not use Vite port 5174.".PHP_EOL;
echo "Browsers should call same-origin /api/* after the frontend is built.".PHP_EOL.PHP_EOL;

$checks = [
    '/api/v1/health',
    '/api/health',
];

foreach ($checks as $path) {
    $ch = curl_init($baseUrl.$path);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ['Accept: application/json'],
        CURLOPT_TIMEOUT => 15,
    ]);

    $response = curl_exec($ch);
    $error = curl_error($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    echo "GET {$path} -> HTTP {$status}".PHP_EOL;
    if ($error) {
        echo "Error: {$error}".PHP_EOL;
    } else {
        echo "Response: ".substr((string) $response, 0, 300).PHP_EOL;
    }
    echo PHP_EOL;
}

if (!is_file(__DIR__.'/public/index.php')) {
    echo "WARNING: public/index.php was not found relative to this file.".PHP_EOL;
}

echo "Expected: /api/v1/health returns HTTP 200 JSON.".PHP_EOL;
echo "If it returns Hostinger 404 HTML, Apache is not routing requests to Laravel public/index.php.".PHP_EOL;
