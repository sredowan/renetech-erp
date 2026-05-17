<?php

namespace Tests\Feature;

use Tests\TestCase;

class Phase1AuthSurfaceTest extends TestCase
{
    public function test_login_requires_email_and_password_with_node_compatible_error(): void
    {
        $response = $this->postJson('/api/v1/auth/login', []);

        $response
            ->assertStatus(400)
            ->assertJson([
                'error' => 'Email and password are required.',
            ]);
    }

    public function test_protected_auth_me_requires_bearer_token(): void
    {
        $this->getJson('/api/v1/auth/me')->assertUnauthorized();
    }

    public function test_phase_1_routes_are_registered(): void
    {
        $routes = collect(app('router')->getRoutes())->map(fn ($route) => implode('|', $route->methods()).' '.$route->uri());

        foreach ([
            'POST api/v1/auth/login',
            'GET|HEAD api/v1/auth/me',
            'POST api/v1/auth/logout',
            'POST api/v1/auth/register',
            'GET|HEAD api/v1/auth/staff',
            'PATCH api/v1/auth/role',
            'PATCH api/v1/auth/staff-password',
            'GET|HEAD api/v1/branches',
            'GET|HEAD api/v1/rbac/config',
            'PUT api/v1/rbac/config',
            'GET|HEAD api/v1/settings',
            'PUT api/v1/settings',
        ] as $expectedRoute) {
            $this->assertTrue($routes->contains($expectedRoute), "Missing route: {$expectedRoute}");
        }
    }
}
