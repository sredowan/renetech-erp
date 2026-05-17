<?php

namespace Tests\Feature;

use Tests\TestCase;

class Phase6PublicWebsiteReportErpSurfaceTest extends TestCase
{
    public function test_phase_6_public_website_dashboard_report_and_erp_routes_are_registered(): void
    {
        $routes = collect(app('router')->getRoutes())
            ->map(fn ($route) => implode('|', $route->methods()).' '.$route->uri());

        foreach ([
            'GET|HEAD api/v1/public/tracking-config',
            'GET|HEAD api/v1/public/branches',
            'GET|HEAD api/v1/public/branches/{slug}',
            'GET|HEAD api/v1/public/branches/{slug}/courses',
            'GET|HEAD api/v1/public/branches/{slug}/blog',
            'GET|HEAD api/v1/public/courses',
            'GET|HEAD api/v1/public/courses/{slug}',
            'GET|HEAD api/v1/public/courses/{slug}/batches',
            'GET|HEAD api/v1/public/blog',
            'GET|HEAD api/v1/public/blog/{slug}',
            'GET|HEAD api/v1/public/resources',
            'GET|HEAD api/v1/public/resources/{slug}',
            'POST api/v1/public/contact',
            'POST api/v1/public/enquiries',
            'POST api/v1/public/student-bookings',
            'GET|HEAD api/v1/website/blogs',
            'POST api/v1/website/blogs',
            'PUT api/v1/website/blogs/{id}',
            'DELETE api/v1/website/blogs/{id}',
            'POST api/v1/website/blogs/upload-image',
            'GET|HEAD api/v1/website/courses',
            'POST api/v1/website/courses/upload-image',
            'PUT api/v1/website/courses/{id}',
            'GET|HEAD api/v1/website/resources',
            'POST api/v1/website/resources',
            'PUT api/v1/website/resources/{id}',
            'DELETE api/v1/website/resources/{id}',
            'POST api/v1/website/resources/upload',
            'GET|HEAD api/v1/dashboard/stats',
            'GET|HEAD api/v1/reports/comparison',
            'GET|HEAD api/v1/reports/trends',
            'GET|HEAD api/v1/reports/sources',
            'GET|HEAD api/v1/erp/rooms',
            'POST api/v1/erp/rooms',
            'GET|HEAD api/v1/erp/bookings',
            'POST api/v1/erp/bookings',
            'DELETE api/v1/erp/bookings/{id}',
        ] as $expectedRoute) {
            $this->assertTrue($routes->contains($expectedRoute), "Missing route: {$expectedRoute}");
        }
    }

    public function test_phase_6_public_routes_do_not_require_bearer_token(): void
    {
        $routes = collect(app('router')->getRoutes());

        foreach ([
            'api/v1/public/tracking-config',
            'api/v1/public/branches',
            'api/v1/public/branches/{slug}',
            'api/v1/public/branches/{slug}/courses',
            'api/v1/public/branches/{slug}/blog',
            'api/v1/public/courses',
            'api/v1/public/courses/{slug}',
            'api/v1/public/courses/{slug}/batches',
            'api/v1/public/blog',
            'api/v1/public/blog/{slug}',
            'api/v1/public/resources',
            'api/v1/public/resources/{slug}',
            'api/v1/public/contact',
            'api/v1/public/enquiries',
            'api/v1/public/student-bookings',
        ] as $uri) {
            $route = $routes->first(fn ($route) => $route->uri() === $uri);

            $this->assertNotNull($route, "Missing route: {$uri}");
            $this->assertNotContains('auth:sanctum', $route->gatherMiddleware(), "Public route requires auth: {$uri}");
        }
    }

    public function test_phase_6_protected_routes_require_bearer_token(): void
    {
        $this->getJson('/api/v1/website/blogs')->assertUnauthorized();
        $this->getJson('/api/v1/website/courses')->assertUnauthorized();
        $this->getJson('/api/v1/website/resources')->assertUnauthorized();
        $this->getJson('/api/v1/dashboard/stats')->assertUnauthorized();
        $this->getJson('/api/v1/reports/comparison')->assertUnauthorized();
        $this->getJson('/api/v1/reports/trends')->assertUnauthorized();
        $this->getJson('/api/v1/reports/sources')->assertUnauthorized();
        $this->getJson('/api/v1/erp/rooms')->assertUnauthorized();
        $this->getJson('/api/v1/erp/bookings')->assertUnauthorized();
    }
}
