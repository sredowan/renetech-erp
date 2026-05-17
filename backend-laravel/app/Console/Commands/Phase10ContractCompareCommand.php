<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Throwable;

class Phase10ContractCompareCommand extends Command
{
    protected $signature = 'migration:phase10-contracts
        {--node= : Base URL for the Node API, for example http://127.0.0.1:5000}
        {--laravel= : Base URL for the Laravel API, for example http://127.0.0.1:8000}
        {--endpoint=* : Restrict comparison to one or more paths}
        {--list : List configured golden-contract endpoints without making HTTP requests}';

    protected $description = 'List or compare representative Node and Laravel golden API contracts.';

    public function handle(): int
    {
        $contracts = collect(config('migration_contracts.endpoints', []));
        $requested = collect($this->option('endpoint'))->filter()->values();
        if ($requested->isNotEmpty()) {
            $contracts = $contracts->filter(fn (array $contract) => $requested->contains($contract['path']));
        }

        if ($contracts->isEmpty()) {
            $this->error('No matching contract endpoints configured.');
            return self::FAILURE;
        }

        if ($this->option('list') || !$this->option('node') || !$this->option('laravel')) {
            $this->table(['Method', 'Path', 'Group', 'Notes'], $contracts->map(fn (array $contract) => [
                $contract['method'],
                $contract['path'],
                $contract['group'],
                $contract['notes'] ?? '',
            ])->all());

            if (!$this->option('list')) {
                $this->line('Provide --node and --laravel to compare live responses.');
            }

            return self::SUCCESS;
        }

        $failed = 0;
        foreach ($contracts as $contract) {
            if (!$this->compareContract($contract)) {
                $failed++;
            }
        }

        if ($failed > 0) {
            $this->error("{$failed} contract comparison(s) failed.");
            return self::FAILURE;
        }

        $this->info('All selected contract comparisons passed.');
        return self::SUCCESS;
    }

    private function compareContract(array $contract): bool
    {
        $nodeUrl = $this->url($this->option('node'), $contract['path']);
        $laravelUrl = $this->url($this->option('laravel'), $this->laravelPath($contract['path']));

        try {
            $node = $this->request($contract, $nodeUrl);
            $laravel = $this->request($contract, $laravelUrl);
        } catch (Throwable $exception) {
            $this->error("{$contract['method']} {$contract['path']} request failed: {$exception->getMessage()}");
            return false;
        }

        $ok = true;
        if ($node->status() !== $laravel->status()) {
            $this->error("{$contract['method']} {$contract['path']} status mismatch: Node {$node->status()} vs Laravel {$laravel->status()}");
            $ok = false;
        }

        $nodeJson = $node->json();
        $laravelJson = $laravel->json();
        if (gettype($nodeJson) !== gettype($laravelJson)) {
            $this->error("{$contract['method']} {$contract['path']} JSON type mismatch: Node ".gettype($nodeJson).' vs Laravel '.gettype($laravelJson));
            return false;
        }

        if (is_array($nodeJson) && array_is_list($nodeJson) !== array_is_list($laravelJson)) {
            $this->error("{$contract['method']} {$contract['path']} JSON shape mismatch: list/object differs.");
            $ok = false;
        }

        if (is_array($nodeJson) && !array_is_list($nodeJson) && !array_is_list($laravelJson)) {
            $missingKeys = array_diff(array_keys($nodeJson), array_keys($laravelJson));
            if ($missingKeys) {
                $this->error("{$contract['method']} {$contract['path']} missing Laravel keys: ".implode(', ', $missingKeys));
                $ok = false;
            }
        }

        if ($ok) {
            $this->info("PASS {$contract['method']} {$contract['path']}");
        }

        return $ok;
    }

    private function request(array $contract, string $url)
    {
        $method = strtolower($contract['method']);
        $payload = $contract['body'] ?? [];

        return match ($method) {
            'post' => Http::acceptJson()->post($url, $payload),
            'put' => Http::acceptJson()->put($url, $payload),
            'patch' => Http::acceptJson()->patch($url, $payload),
            'delete' => Http::acceptJson()->delete($url, $payload),
            default => Http::acceptJson()->get($url),
        };
    }

    private function laravelPath(string $nodePath): string
    {
        return str_starts_with($nodePath, '/api/') ? '/api/v1/'.substr($nodePath, 5) : $nodePath;
    }

    private function url(string $baseUrl, string $path): string
    {
        return rtrim($baseUrl, '/').'/'.ltrim($path, '/');
    }
}
