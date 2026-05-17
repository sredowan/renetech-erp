<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\File;
use Tests\TestCase;

class Phase8UploadCompatibilityTest extends TestCase
{
    private string $publicUploadRoot;

    protected function setUp(): void
    {
        parent::setUp();

        $this->publicUploadRoot = public_path('uploads');
        File::ensureDirectoryExists($this->publicUploadRoot.'/courses');
        File::ensureDirectoryExists($this->publicUploadRoot.'/private');
        File::put($this->publicUploadRoot.'/courses/public-test.txt', 'public upload');
        File::put($this->publicUploadRoot.'/private/protected-test.txt', 'protected upload');
    }

    protected function tearDown(): void
    {
        File::delete($this->publicUploadRoot.'/courses/public-test.txt');
        File::delete($this->publicUploadRoot.'/private/protected-test.txt');

        parent::tearDown();
    }

    public function test_public_upload_directories_do_not_require_authentication(): void
    {
        $this->get('/uploads/courses/public-test.txt')
            ->assertOk()
            ->assertHeader('Cache-Control', 'max-age=86400, public');
    }

    public function test_generic_uploads_require_token(): void
    {
        $this->getJson('/uploads/private/protected-test.txt')
            ->assertUnauthorized()
            ->assertJson(['error' => 'Authentication required']);
    }

    public function test_upload_path_traversal_is_rejected(): void
    {
        $this->get('/uploads/courses/%2E%2E/private/protected-test.txt')
            ->assertNotFound();
    }
}
