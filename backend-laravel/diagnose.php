<?php
// This test goes through the VITE PROXY (port 5174) exactly like the browser does

echo "=== TESTING THROUGH VITE PROXY (port 5174) ===" . PHP_EOL;
echo "This mimics exactly what the browser does" . PHP_EOL . PHP_EOL;

$ch = curl_init();

// Step 1: Login through the Vite proxy
curl_setopt($ch, CURLOPT_URL, "http://127.0.0.1:5174/api/auth/login");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['email' => 'admin@renetech.com', 'password' => 'Redowan173123']));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "Accept: application/json"
]);
$loginResp = curl_exec($ch);
$loginCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
echo "1. POST /api/auth/login (via proxy, HTTP $loginCode)" . PHP_EOL;
echo "   Response: " . substr($loginResp, 0, 200) . PHP_EOL;

$loginData = json_decode($loginResp, true);
$token = $loginData['token'] ?? null;
echo "   Token: " . ($token ? substr($token, 0, 25) . "..." : "NONE!") . PHP_EOL;
echo PHP_EOL;

if (!$token) {
    echo "FATAL: No token received. Cannot continue." . PHP_EOL;
    exit(1);
}

// Step 2: Call /api/auth/me through the proxy with the token
curl_setopt($ch, CURLOPT_URL, "http://127.0.0.1:5174/api/auth/me");
curl_setopt($ch, CURLOPT_HTTPGET, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $token",
    "Accept: application/json"
]);
$meResp = curl_exec($ch);
$meCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
echo "2. GET /api/auth/me (via proxy, HTTP $meCode)" . PHP_EOL;
echo "   Response: " . substr($meResp, 0, 200) . PHP_EOL;
echo PHP_EOL;

// Step 3: Dashboard stats through proxy
curl_setopt($ch, CURLOPT_URL, "http://127.0.0.1:5174/api/dashboard/stats?role=super_admin");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $token",
    "Accept: application/json"
]);
$dashResp = curl_exec($ch);
$dashCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
echo "3. GET /api/dashboard/stats (via proxy, HTTP $dashCode)" . PHP_EOL;
echo "   Response: " . substr($dashResp, 0, 200) . PHP_EOL;
echo PHP_EOL;

// Step 4: Same call directly to Laravel (bypass proxy)
curl_setopt($ch, CURLOPT_URL, "http://127.0.0.1:8000/api/v1/dashboard/stats?role=super_admin");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $token",
    "Accept: application/json"
]);
$directResp = curl_exec($ch);
$directCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
echo "4. GET /api/v1/dashboard/stats (DIRECT to Laravel, HTTP $directCode)" . PHP_EOL;
echo "   Response: " . substr($directResp, 0, 200) . PHP_EOL;
echo PHP_EOL;

// Step 5: Branches through proxy
curl_setopt($ch, CURLOPT_URL, "http://127.0.0.1:5174/api/branches");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $token",
    "Accept: application/json"
]);
$branchResp = curl_exec($ch);
$branchCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
echo "5. GET /api/branches (via proxy, HTTP $branchCode)" . PHP_EOL;
echo "   Response: " . substr($branchResp, 0, 200) . PHP_EOL;
echo PHP_EOL;

curl_close($ch);

echo "=== DIAGNOSIS ===" . PHP_EOL;
if ($meCode == 200 && $dashCode == 200) {
    echo "PROXY is working fine. Issue might be in frontend JS." . PHP_EOL;
} elseif ($meCode == 401 || $dashCode == 401) {
    echo "PROXY returns 401! The Vite proxy is NOT forwarding the Authorization header correctly." . PHP_EOL;
    echo "OR Sanctum sees the proxy request as 'stateful' and ignores the bearer token." . PHP_EOL;
}
