<?php

return [
    'endpoints' => [
        ['group' => 'health', 'method' => 'GET', 'path' => '/api/health', 'notes' => 'Legacy health bridge to Laravel v1.'],
        ['group' => 'auth', 'method' => 'POST', 'path' => '/api/auth/login', 'body' => [], 'notes' => 'Validation/error shape without credentials.'],
        ['group' => 'auth', 'method' => 'GET', 'path' => '/api/auth/me', 'notes' => 'Unauthenticated Bearer-token requirement.'],
        ['group' => 'public', 'method' => 'GET', 'path' => '/api/public/branches', 'notes' => 'Public branch array shape.'],
        ['group' => 'public', 'method' => 'GET', 'path' => '/api/public/courses', 'notes' => 'Public course array shape.'],
        ['group' => 'public', 'method' => 'GET', 'path' => '/api/public/blog', 'notes' => 'Public blog array shape.'],
        ['group' => 'public', 'method' => 'GET', 'path' => '/api/public/resources', 'notes' => 'Public resources array shape.'],
        ['group' => 'payment', 'method' => 'GET', 'path' => '/api/payment/config', 'notes' => 'Demo payment config only.'],
        ['group' => 'crm', 'method' => 'GET', 'path' => '/api/crm/leads', 'notes' => 'Protected route unauthenticated shape.'],
        ['group' => 'website', 'method' => 'GET', 'path' => '/api/website/blogs', 'notes' => 'Protected route unauthenticated shape.'],
    ],
];
