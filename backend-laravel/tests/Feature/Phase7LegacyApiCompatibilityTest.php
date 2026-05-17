<?php

namespace Tests\Feature;

use Tests\TestCase;

class Phase7LegacyApiCompatibilityTest extends TestCase
{
    public function test_legacy_api_health_forwards_to_v1_without_redirecting(): void
    {
        $response = $this->getJson('/api/health');

        $response
            ->assertOk()
            ->assertJson([
                'status' => 'ok',
                'service' => 'language-academy-laravel-api',
                'timezone' => 'Asia/Dhaka',
            ]);
    }

    public function test_legacy_auth_login_forwards_request_body_to_v1(): void
    {
        $this->postJson('/api/auth/login', [])
            ->assertStatus(400)
            ->assertJson([
                'error' => 'Email and password are required.',
            ]);
    }

    public function test_legacy_protected_routes_keep_bearer_auth_requirement(): void
    {
        $this->getJson('/api/auth/me')->assertUnauthorized();
        $this->getJson('/api/crm/leads')->assertUnauthorized();
        $this->getJson('/api/website/blogs')->assertUnauthorized();
    }

    public function test_unknown_v1_route_does_not_forward_recursively(): void
    {
        $this->getJson('/api/v1/not-a-real-route')->assertNotFound();
    }
}
