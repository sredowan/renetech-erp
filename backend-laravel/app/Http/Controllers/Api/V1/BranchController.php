<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BranchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Branch::query()->with('manager:id,name,email')->orderBy('type')->orderBy('name');

        if ($request->user()->role === 'branch_admin') {
            $query->where('id', $request->user()->branch_id);
        }

        $branches = $query->get()->map(function (Branch $branch) {
            $data = $branch->toArray();
            $data['Manager'] = $branch->manager;
            unset($data['manager']);

            $data['studentCount'] = $this->safeCount('students', $branch->id);
            $data['staffCount'] = DB::table('users')
                ->where('branch_id', $branch->id)
                ->whereNotIn('role', ['student', 'guardian'])
                ->count();
            $data['courseCount'] = $this->safeCount('courses', $branch->id);
            $data['leadCount'] = $this->safeCount('leads', $branch->id);

            return $data;
        });

        return ApiResponse::success($branches);
    }

    private function safeCount(string $table, int $branchId): int
    {
        try {
            return DB::table($table)->where('branch_id', $branchId)->count();
        } catch (\Throwable) {
            return 0;
        }
    }
}
