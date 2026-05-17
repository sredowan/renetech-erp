<?php

namespace Tests\Feature;

use Tests\TestCase;

class Phase4HrmPayrollSurfaceTest extends TestCase
{
    public function test_phase_4_hrm_and_payroll_routes_are_registered(): void
    {
        $routes = collect(app('router')->getRoutes())
            ->map(fn ($route) => implode('|', $route->methods()).' '.$route->uri());

        foreach ([
            'POST api/v1/hrm/attendance/self-checkin',
            'POST api/v1/hrm/attendance/mark',
            'GET|HEAD api/v1/hrm/attendance',
            'GET|HEAD api/v1/hrm/attendance/summary',
            'GET|HEAD api/v1/hrm/attendance/my',
            'GET|HEAD api/v1/hrm/leave-types',
            'POST api/v1/hrm/leave-types',
            'GET|HEAD api/v1/hrm/leaves',
            'POST api/v1/hrm/leaves',
            'PATCH api/v1/hrm/leaves/{id}/approve',
            'PATCH api/v1/hrm/leaves/{id}/reject',
            'GET|HEAD api/v1/hrm/leaves/my',
            'GET|HEAD api/v1/hrm/leaves/balance',
            'GET|HEAD api/v1/hrm/jobs',
            'POST api/v1/hrm/jobs',
            'PATCH api/v1/hrm/jobs/{id}',
            'DELETE api/v1/hrm/jobs/{id}',
            'GET|HEAD api/v1/hrm/applicants',
            'POST api/v1/hrm/applicants',
            'PATCH api/v1/hrm/applicants/{id}',
            'POST api/v1/hrm/applicants/{id}/hire',
            'GET|HEAD api/v1/hrm/documents',
            'POST api/v1/hrm/documents',
            'DELETE api/v1/hrm/documents/{id}',
            'GET|HEAD api/v1/hrm/documents/expiring',
            'GET|HEAD api/v1/hrm/reviews',
            'POST api/v1/hrm/reviews',
            'PATCH api/v1/hrm/reviews/{id}',
            'GET|HEAD api/v1/hrm/reviews/my',
            'GET|HEAD api/v1/hrm/shifts',
            'POST api/v1/hrm/shifts',
            'PATCH api/v1/hrm/shifts/{id}',
            'GET|HEAD api/v1/hrm/schedules',
            'POST api/v1/hrm/schedules',
            'DELETE api/v1/hrm/schedules/{id}',
            'GET|HEAD api/v1/hrm/org-chart',
            'GET|HEAD api/v1/hrm/dashboard/stats',
            'GET|HEAD api/v1/hrm/dashboard/birthdays',
            'GET|HEAD api/v1/hrm/dashboard/anniversaries',
            'GET|HEAD api/v1/payroll/staff',
            'POST api/v1/payroll/profiles',
            'PATCH api/v1/payroll/staff/{id}/status',
            'GET|HEAD api/v1/payroll/history',
            'GET|HEAD api/v1/payroll/deductions',
            'POST api/v1/payroll/deductions',
            'PATCH api/v1/payroll/deductions/{id}',
            'DELETE api/v1/payroll/deductions/{id}',
            'GET|HEAD api/v1/payroll/bonuses',
            'POST api/v1/payroll/bonuses',
            'PATCH api/v1/payroll/bonuses/{id}',
            'DELETE api/v1/payroll/bonuses/{id}',
            'GET|HEAD api/v1/payroll/teacher-sessions',
            'POST api/v1/payroll/teacher-sessions',
            'PATCH api/v1/payroll/teacher-sessions/{id}',
            'DELETE api/v1/payroll/teacher-sessions/{id}',
            'POST api/v1/payroll/generate',
            'POST api/v1/payroll/pay/{id}',
            'POST api/v1/payroll/reopen',
        ] as $expectedRoute) {
            $this->assertTrue($routes->contains($expectedRoute), "Missing route: {$expectedRoute}");
        }
    }

    public function test_phase_4_protected_routes_require_bearer_token(): void
    {
        $this->postJson('/api/v1/hrm/attendance/self-checkin', [])->assertUnauthorized();
        $this->getJson('/api/v1/hrm/attendance')->assertUnauthorized();
        $this->getJson('/api/v1/hrm/leaves')->assertUnauthorized();
        $this->getJson('/api/v1/hrm/jobs')->assertUnauthorized();
        $this->getJson('/api/v1/hrm/documents')->assertUnauthorized();
        $this->getJson('/api/v1/hrm/reviews')->assertUnauthorized();
        $this->getJson('/api/v1/hrm/shifts')->assertUnauthorized();
        $this->getJson('/api/v1/hrm/schedules')->assertUnauthorized();
        $this->getJson('/api/v1/payroll/staff')->assertUnauthorized();
        $this->getJson('/api/v1/payroll/history')->assertUnauthorized();
    }
}
