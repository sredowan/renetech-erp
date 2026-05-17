<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthEndpointTest extends TestCase
{
    public function test_api_health_endpoint_returns_status_payload(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response
            ->assertOk()
            ->assertJson([
                'status' => 'ok',
                'service' => 'language-academy-laravel-api',
                'timezone' => 'Asia/Dhaka',
            ])
            ->assertJsonStructure([
                'status',
                'service',
                'timestamp',
                'timezone',
            ]);
    }
}
