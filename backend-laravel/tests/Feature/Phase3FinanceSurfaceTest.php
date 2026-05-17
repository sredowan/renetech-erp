<?php

namespace Tests\Feature;

use Tests\TestCase;

class Phase3FinanceSurfaceTest extends TestCase
{
    public function test_phase_3_finance_routes_are_registered(): void
    {
        $routes = collect(app('router')->getRoutes())
            ->map(fn ($route) => implode('|', $route->methods()).' '.$route->uri());

        foreach ([
            'GET|HEAD api/v1/accounting/accounts',
            'POST api/v1/accounting/journal-entries',
            'GET|HEAD api/v1/accounting/journal',
            'GET|HEAD api/v1/accounting/ledger-summary',
            'GET|HEAD api/v1/accounting/ledger/{id}',
            'GET|HEAD api/v1/accounting/audit-log',
            'POST api/v1/finance/expense',
            'GET|HEAD api/v1/finance/stats',
            'GET|HEAD api/v1/finance/overview',
            'GET|HEAD api/v1/finance/report-suite',
            'GET|HEAD api/v1/finance/profit-loss',
            'GET|HEAD api/v1/finance/trial-balance',
            'GET|HEAD api/v1/finance/cashflow',
            'GET|HEAD api/v1/finance/income-expense',
            'GET|HEAD api/v1/finance/student-income',
            'GET|HEAD api/v1/finance/accounts/liquid',
            'POST api/v1/finance/accounts/liquid',
            'GET|HEAD api/v1/invoices',
            'GET|HEAD api/v1/invoices/stats',
            'GET|HEAD api/v1/invoices/aging',
            'POST api/v1/invoices',
            'GET|HEAD api/v1/invoices/categories',
            'GET|HEAD api/v1/invoices/categories/flat',
            'POST api/v1/invoices/categories',
            'PUT api/v1/invoices/categories/{id}',
            'DELETE api/v1/invoices/categories/{id}',
            'GET|HEAD api/v1/invoices/customers',
            'POST api/v1/invoices/customers',
            'PUT api/v1/invoices/customers/{id}',
            'DELETE api/v1/invoices/customers/{id}',
            'POST api/v1/invoices/{id}/pay',
            'PUT api/v1/invoices/{id}',
            'GET|HEAD api/v1/expenses',
            'GET|HEAD api/v1/expenses/split',
            'POST api/v1/expenses',
            'PUT api/v1/expenses/{id}',
            'PUT api/v1/expenses/{id}/payment-source',
            'PUT api/v1/expenses/{id}/verify',
            'PUT api/v1/expenses/{id}/approve',
            'PUT api/v1/expenses/{id}/reject',
            'DELETE api/v1/expenses/{id}',
            'GET|HEAD api/v1/expenses/categories',
            'GET|HEAD api/v1/expenses/categories/flat',
            'POST api/v1/expenses/categories',
            'PUT api/v1/expenses/categories/{id}',
            'DELETE api/v1/expenses/categories/{id}',
            'GET|HEAD api/v1/budget',
            'POST api/v1/budget',
            'GET|HEAD api/v1/budget/vs-actual',
            'GET|HEAD api/v1/assets/stats',
            'GET|HEAD api/v1/assets',
            'POST api/v1/assets',
            'PUT api/v1/assets/{id}',
            'DELETE api/v1/assets/{id}',
            'GET|HEAD api/v1/pos/transactions',
            'GET|HEAD api/v1/pos/pending',
            'POST api/v1/pos/collect-fee',
            'POST api/v1/pos/collect-custom-income',
            'POST api/v1/pos/reject-fee',
            'GET|HEAD api/v1/reconciliation/stats',
            'GET|HEAD api/v1/reconciliation/dashboard',
            'GET|HEAD api/v1/reconciliation/reports',
            'GET|HEAD api/v1/reconciliation/accounts',
            'GET|HEAD api/v1/reconciliation/mappings',
            'POST api/v1/reconciliation/mappings',
            'PUT api/v1/reconciliation/mappings/{id}',
            'DELETE api/v1/reconciliation/mappings/{id}',
            'POST api/v1/reconciliation/generate',
            'POST api/v1/reconciliation/opening-balance',
            'POST api/v1/reconciliation/collections',
            'POST api/v1/reconciliation/transfers',
            'POST api/v1/reconciliation/closing-balance',
            'GET|HEAD api/v1/reconciliation/sessions',
            'GET|HEAD api/v1/reconciliation/sessions/{id}',
            'POST api/v1/reconciliation/sessions/{id}/review',
            'POST api/v1/reconciliation/sessions/{id}/approve',
            'POST api/v1/reconciliation/sessions/{id}/reopen',
            'POST api/v1/reconciliation/sessions/{id}/lock',
            'GET|HEAD api/v1/reconciliation/lines/{lineId}/detail',
            'PATCH api/v1/reconciliation/lines/{lineId}',
            'GET|HEAD api/v1/payment/config',
            'POST api/v1/payment/initiate',
            'POST api/v1/payment/success',
            'POST api/v1/payment/fail',
            'POST api/v1/payment/cancel',
            'GET|HEAD api/v1/payment/status/{reference}',
            'POST api/v1/payment/simulate',
        ] as $expectedRoute) {
            $this->assertTrue($routes->contains($expectedRoute), "Missing route: {$expectedRoute}");
        }
    }

    public function test_phase_3_protected_routes_require_bearer_token(): void
    {
        $this->getJson('/api/v1/accounting/accounts')->assertUnauthorized();
        $this->getJson('/api/v1/finance/stats')->assertUnauthorized();
        $this->getJson('/api/v1/invoices')->assertUnauthorized();
        $this->getJson('/api/v1/expenses')->assertUnauthorized();
        $this->getJson('/api/v1/budget')->assertUnauthorized();
        $this->getJson('/api/v1/assets')->assertUnauthorized();
        $this->getJson('/api/v1/pos/transactions')->assertUnauthorized();
        $this->getJson('/api/v1/reconciliation/stats')->assertUnauthorized();
        $this->postJson('/api/v1/payment/simulate', [])->assertUnauthorized();
    }
}
