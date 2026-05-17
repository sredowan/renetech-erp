<?php

/**
 * Laravel development server router.
 *
 * Handles SPA sub-path routing for admin/student/teacher portals
 * that the default PHP built-in server cannot process (no .htaccess).
 */

$publicPath = getcwd();

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? ''
);

// SPA portals — if the URI starts with one of these prefixes and the
// exact file doesn't exist, serve the portal's index.html so the
// client-side router handles it.
$spaPortals = ['admin', 'student', 'teacher', 'hrm', 'brandmanager', 'accounting'];

foreach ($spaPortals as $portal) {
    if (preg_match("#^/{$portal}(/|$)#", $uri)) {
        $filePath = $publicPath . $uri;

        // If the exact file exists, serve it (JS, CSS, images, etc.)
        if (is_file($filePath)) {
            return false;
        }

        // Otherwise, serve the SPA index.html for client-side routing
        $indexPath = $publicPath . "/{$portal}/index.html";
        if (is_file($indexPath)) {
            header('Content-Type: text/html; charset=UTF-8');
            readfile($indexPath);
            return;
        }
    }
}

// Default Laravel behavior — serve static files or fall through to index.php
if ($uri !== '/' && file_exists($publicPath . $uri)) {
    return false;
}

require_once $publicPath . '/index.php';
