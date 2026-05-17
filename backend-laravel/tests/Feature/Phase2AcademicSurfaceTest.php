<?php

namespace Tests\Feature;

use Tests\TestCase;

class Phase2AcademicSurfaceTest extends TestCase
{
    public function test_phase_2_academic_routes_are_registered(): void
    {
        $routes = collect(app('router')->getRoutes())
            ->map(fn ($route) => implode('|', $route->methods()).' '.$route->uri());

        foreach ([
            'GET|HEAD api/v1/lms/batches',
            'POST api/v1/lms/batches',
            'GET|HEAD api/v1/lms/batches/{id}',
            'PUT api/v1/lms/batches/{id}',
            'GET|HEAD api/v1/lms/batches/{id}/students',
            'POST api/v1/lms/batches/{id}/notify',
            'PATCH api/v1/lms/batches/{id}/status',
            'GET|HEAD api/v1/lms/courses',
            'POST api/v1/lms/courses',
            'PUT api/v1/lms/courses/{id}',
            'POST api/v1/lms/courses/upload-image',
            'GET|HEAD api/v1/students',
            'POST api/v1/students',
            'PUT api/v1/students/me',
            'POST api/v1/students/enroll',
            'GET|HEAD api/v1/students/{id}',
            'PUT api/v1/students/{id}',
            'PUT api/v1/students/{id}/photo',
            'GET|HEAD api/v1/students/{id}/activities',
            'POST api/v1/students/{id}/activities',
            'PATCH api/v1/students/{id}/management',
            'PATCH api/v1/students/{id}/success-record',
            'POST api/v1/students/{id}/request-partner-access',
            'PUT api/v1/student/me',
            'GET|HEAD api/v1/enrollments',
            'POST api/v1/enrollments',
            'GET|HEAD api/v1/attendance/student/me',
            'POST api/v1/attendance/mark',
            'GET|HEAD api/v1/attendance/batch',
            'GET|HEAD api/v1/attendance/student/{student_id}',
            'GET|HEAD api/v1/schedule',
            'GET|HEAD api/v1/materials/batch/{batch_id}',
            'POST api/v1/materials',
            'DELETE api/v1/materials/{id}',
            'POST api/v1/materials/share',
            'GET|HEAD api/v1/pte/tasks',
            'POST api/v1/pte/attempts',
            'GET|HEAD api/v1/pte/performance',
            'GET|HEAD api/v1/pte/performance/branch',
        ] as $expectedRoute) {
            $this->assertTrue($routes->contains($expectedRoute), "Missing route: {$expectedRoute}");
        }
    }

    public function test_phase_2_protected_routes_require_bearer_token(): void
    {
        $this->getJson('/api/v1/lms/batches')->assertUnauthorized();
        $this->getJson('/api/v1/students')->assertUnauthorized();
        $this->postJson('/api/v1/enrollments', [])->assertUnauthorized();
        $this->getJson('/api/v1/attendance/student/me')->assertUnauthorized();
        $this->getJson('/api/v1/schedule')->assertUnauthorized();
        $this->getJson('/api/v1/materials/batch/1')->assertUnauthorized();
        $this->getJson('/api/v1/pte/tasks', ['x-device-id' => 'test-device'])->assertUnauthorized();
    }
}
