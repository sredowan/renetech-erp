<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Support\ApiResponse;
use App\Support\BranchScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $batches = BranchScope::apply(Batch::query(), $request)
            ->with(['course:id,title', 'trainer:id,name,email'])
            ->whereNotNull('schedule')
            ->orderBy('start_date')
            ->get();

        return ApiResponse::success($batches);
    }
}
