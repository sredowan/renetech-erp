<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class Phase1AuthSurfaceTest extends TestCase
{
    use DatabaseTransactions;

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

    public function test_plain_api_auth_request_returns_json_401_without_login_redirect(): void
    {
        $response = $this->get('/api/v1/auth/me');

        $response
            ->assertUnauthorized()
            ->assertJson([
                'error' => 'Unauthenticated.',
            ]);
    }

    public function test_login_returns_lowercase_user_payload_for_admin_frontend(): void
    {
        $branch = Branch::query()->create([
            'name' => 'Test HQ',
            'code' => 'TEST-HQ',
            'slug' => 'test-hq-'.uniqid(),
            'type' => 'head',
            'is_active' => true,
        ]);

        $email = 'admin-'.uniqid().'@example.com';

        User::query()->create([
            'name' => 'Test Admin',
            'email' => $email,
            'password' => 'Password123',
            'role' => 'super_admin',
            'branch_id' => $branch->id,
            'status' => 'active',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $email,
            'password' => 'Password123',
        ]);

        $response
            ->assertOk()
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role', 'branch_id']])
            ->assertJsonMissingPath('User');
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
