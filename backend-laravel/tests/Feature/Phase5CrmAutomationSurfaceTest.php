<?php

namespace Tests\Feature;

use Tests\TestCase;

class Phase5CrmAutomationSurfaceTest extends TestCase
{
    public function test_phase_5_crm_automation_and_notification_routes_are_registered(): void
    {
        $routes = collect(app('router')->getRoutes())
            ->map(fn ($route) => implode('|', $route->methods()).' '.$route->uri());

        foreach ([
            'GET|HEAD api/v1/crm/courses',
            'GET|HEAD api/v1/crm/leads',
            'POST api/v1/crm/leads',
            'PUT api/v1/crm/leads/{id}',
            'PATCH api/v1/crm/leads/{id}/status',
            'DELETE api/v1/crm/leads/{id}',
            'POST api/v1/crm/leads/{id}/convert',
            'POST api/v1/crm/leads/{id}/enroll',
            'POST api/v1/crm/leads/{id}/successful',
            'GET|HEAD api/v1/crm/contacts',
            'POST api/v1/crm/contacts',
            'POST api/v1/crm/contacts/bulk-upload',
            'PATCH api/v1/crm/contacts/bulk-status',
            'GET|HEAD api/v1/crm/contacts/{id}',
            'PUT api/v1/crm/contacts/{id}',
            'DELETE api/v1/crm/contacts/{id}',
            'GET|HEAD api/v1/crm/opportunities',
            'POST api/v1/crm/opportunities',
            'PUT api/v1/crm/opportunities/{id}',
            'DELETE api/v1/crm/opportunities/{id}',
            'POST api/v1/crm/opportunities/{id}/win',
            'POST api/v1/crm/opportunities/{id}/lose',
            'GET|HEAD api/v1/crm/activities',
            'POST api/v1/crm/activities',
            'PATCH api/v1/crm/activities/{id}/complete',
            'GET|HEAD api/v1/crm/campaigns',
            'POST api/v1/crm/campaigns',
            'POST api/v1/crm/campaigns/{id}/send',
            'DELETE api/v1/crm/campaigns/{id}',
            'GET|HEAD api/v1/crm/analytics/funnel',
            'GET|HEAD api/v1/crm/analytics/source',
            'GET|HEAD api/v1/crm/analytics/forecast',
            'GET|HEAD api/v1/crm/analytics/success-results',
            'GET|HEAD api/v1/crm/analytics/destination-countries',
            'GET|HEAD api/v1/automation',
            'POST api/v1/automation',
            'POST api/v1/automation/run-birthday-check',
            'PUT api/v1/automation/{id}',
            'PATCH api/v1/automation/{id}/toggle',
            'DELETE api/v1/automation/{id}',
            'GET|HEAD api/v1/notifications',
            'PUT api/v1/notifications/{id}/read',
            'POST api/v1/notifications',
        ] as $expectedRoute) {
            $this->assertTrue($routes->contains($expectedRoute), "Missing route: {$expectedRoute}");
        }
    }

    public function test_phase_5_protected_routes_require_bearer_token(): void
    {
        $this->getJson('/api/v1/crm/leads')->assertUnauthorized();
        $this->getJson('/api/v1/crm/contacts')->assertUnauthorized();
        $this->getJson('/api/v1/crm/opportunities')->assertUnauthorized();
        $this->getJson('/api/v1/crm/activities')->assertUnauthorized();
        $this->getJson('/api/v1/crm/campaigns')->assertUnauthorized();
        $this->getJson('/api/v1/crm/analytics/funnel')->assertUnauthorized();
        $this->getJson('/api/v1/automation')->assertUnauthorized();
        $this->getJson('/api/v1/notifications')->assertUnauthorized();
    }
}
