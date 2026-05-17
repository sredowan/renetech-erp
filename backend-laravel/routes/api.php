<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Support\ApiResponse;
use App\Http\Controllers\Api\LegacyApiForwardController;
use App\Http\Controllers\Api\V1\AccountingController;
use App\Http\Controllers\Api\V1\AssetController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AutomationController;
use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\BranchController;
use App\Http\Controllers\Api\V1\BudgetController;
use App\Http\Controllers\Api\V1\CrmController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\EnrollmentController;
use App\Http\Controllers\Api\V1\ErpController;
use App\Http\Controllers\Api\V1\ExpenseController;
use App\Http\Controllers\Api\V1\FinanceController;
use App\Http\Controllers\Api\V1\HrmController;
use App\Http\Controllers\Api\V1\InvoiceController;
use App\Http\Controllers\Api\V1\LmsController;
use App\Http\Controllers\Api\V1\MaterialController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\PayrollController;
use App\Http\Controllers\Api\V1\PosController;
use App\Http\Controllers\Api\V1\PteController;
use App\Http\Controllers\Api\V1\PublicController;
use App\Http\Controllers\Api\V1\RbacController;
use App\Http\Controllers\Api\V1\ReconciliationController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\ScheduleController;
use App\Http\Controllers\Api\V1\SettingController;
use App\Http\Controllers\Api\V1\StudentController;
use App\Http\Controllers\Api\V1\WebsiteController;

Route::prefix('v1')->middleware('throttle:api')->group(function () {
    Route::get('/health', function () {
        return ApiResponse::success([
            'status' => 'ok',
            'service' => 'language-academy-laravel-api',
            'timestamp' => now()->toISOString(),
            'timezone' => config('app.timezone'),
        ]);
    });

    Route::get('/user', function (Request $request) {
        return ApiResponse::success($request->user());
    })->middleware('auth:sanctum');

    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
        Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
        Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
        Route::post('/register', [AuthController::class, 'register'])->middleware(['auth:sanctum', 'role:super_admin,branch_admin']);
        Route::get('/staff', [AuthController::class, 'staff'])->middleware(['auth:sanctum', 'role:super_admin,branch_admin']);
        Route::patch('/role', [AuthController::class, 'updateRole'])->middleware(['auth:sanctum', 'role:super_admin,branch_admin']);
        Route::patch('/staff-password', [AuthController::class, 'setStaffPassword'])->middleware(['auth:sanctum', 'role:super_admin,branch_admin']);
    });

    Route::get('/branches', [BranchController::class, 'index'])
        ->middleware(['auth:sanctum', 'role:super_admin,branch_admin']);

    Route::get('/rbac/config', [RbacController::class, 'show'])->middleware('auth:sanctum');
    Route::put('/rbac/config', [RbacController::class, 'update'])->middleware(['auth:sanctum', 'role:super_admin,branch_admin']);

    Route::get('/settings', [SettingController::class, 'index'])->middleware(['auth:sanctum', 'role:super_admin']);
    Route::put('/settings', [SettingController::class, 'update'])->middleware(['auth:sanctum', 'role:super_admin']);

    Route::prefix('lms')->middleware('auth:sanctum')->group(function () {
        Route::get('/batches', [LmsController::class, 'batches'])->middleware('role:super_admin,branch_admin,trainer,staff,accounts');
        Route::get('/batches/{id}', [LmsController::class, 'batch'])->middleware('role:super_admin,branch_admin,trainer,staff,accounts');
        Route::get('/batches/{id}/students', [LmsController::class, 'batchStudents'])->middleware('role:super_admin,branch_admin,trainer,staff,accounts');
        Route::get('/courses', [LmsController::class, 'courses'])->middleware('role:super_admin,branch_admin,trainer,staff,accounts');
        Route::post('/batches', [LmsController::class, 'createBatch'])->middleware('role:super_admin,branch_admin,trainer,staff');
        Route::put('/batches/{id}', [LmsController::class, 'updateBatch'])->middleware('role:super_admin,branch_admin,trainer,staff');
        Route::post('/batches/{id}/notify', [LmsController::class, 'notifyBatchStudents'])->middleware('role:super_admin,branch_admin,trainer,staff');
        Route::post('/courses', [LmsController::class, 'createCourse'])->middleware('role:super_admin,branch_admin,trainer,staff');
        Route::put('/courses/{id}', [LmsController::class, 'updateCourse'])->middleware('role:super_admin,branch_admin,trainer,staff');
        Route::post('/courses/upload-image', [LmsController::class, 'uploadCourseImage'])->middleware('role:super_admin,branch_admin,trainer,staff');
        Route::patch('/batches/{id}/status', [LmsController::class, 'updateBatchStatus'])->middleware('role:super_admin,branch_admin,trainer,staff');
    });

    Route::prefix('students')->middleware('auth:sanctum')->group(function () {
        Route::put('/me', [StudentController::class, 'updateMe']);
        Route::post('/enroll', [StudentController::class, 'enroll'])->middleware('role:super_admin,branch_admin,counselor,trainer,staff');
        Route::get('/', [StudentController::class, 'index'])->middleware('role:super_admin,branch_admin,counselor,trainer,staff,accounts');
        Route::post('/', [StudentController::class, 'store'])->middleware('role:super_admin,branch_admin,counselor,trainer,staff');
        Route::get('/{id}', [StudentController::class, 'show'])->middleware('role:super_admin,branch_admin,counselor,trainer,staff,accounts');
        Route::get('/{id}/activities', [StudentController::class, 'activities'])->middleware('role:super_admin,branch_admin,counselor,trainer,staff,accounts');
        Route::put('/{id}', [StudentController::class, 'update'])->middleware('role:super_admin,branch_admin,counselor,trainer,staff');
        Route::put('/{id}/photo', [StudentController::class, 'uploadPhoto'])->middleware('role:super_admin,branch_admin,counselor,trainer,staff');
        Route::patch('/{id}/management', [StudentController::class, 'update'])->middleware('role:super_admin,branch_admin,counselor,trainer,staff');
        Route::patch('/{id}/success-record', [StudentController::class, 'update'])->middleware('role:super_admin,branch_admin,counselor,trainer,staff');
        Route::post('/{id}/activities', [StudentController::class, 'createActivity'])->middleware('role:super_admin,branch_admin,counselor,trainer,staff');
        Route::post('/{id}/request-partner-access', [StudentController::class, 'requestPartnerAccess'])->middleware('role:super_admin,branch_admin,counselor,trainer,staff');
    });

    Route::prefix('student')->middleware('auth:sanctum')->group(function () {
        Route::put('/me', [StudentController::class, 'updateMe']);
    });

    Route::prefix('enrollments')->middleware(['auth:sanctum', 'role:super_admin,branch_admin,counselor,staff'])->group(function () {
        Route::post('/', [EnrollmentController::class, 'store']);
        Route::get('/', [EnrollmentController::class, 'index']);
    });

    Route::prefix('attendance')->middleware('auth:sanctum')->group(function () {
        Route::get('/student/me', [AttendanceController::class, 'myAttendance']);
        Route::post('/mark', [AttendanceController::class, 'mark'])->middleware('role:super_admin,branch_admin,trainer,staff');
        Route::get('/batch', [AttendanceController::class, 'batch'])->middleware('role:super_admin,branch_admin,trainer,staff');
        Route::get('/student/{student_id}', [AttendanceController::class, 'student'])->middleware('role:super_admin,branch_admin,trainer,staff');
    });

    Route::get('/schedule', [ScheduleController::class, 'index'])->middleware('auth:sanctum');

    Route::prefix('materials')->middleware('auth:sanctum')->group(function () {
        Route::get('/batch/{batch_id}', [MaterialController::class, 'byBatch']);
        Route::post('/', [MaterialController::class, 'store'])->middleware('role:super_admin,branch_admin,trainer');
        Route::delete('/{id}', [MaterialController::class, 'destroy'])->middleware('role:super_admin,branch_admin,trainer');
        Route::post('/share', [MaterialController::class, 'share'])->middleware('role:super_admin,branch_admin,trainer');
    });

    Route::prefix('pte')->middleware(['auth:sanctum', 'device'])->group(function () {
        Route::get('/tasks', [PteController::class, 'tasks']);
        Route::post('/attempts', [PteController::class, 'createAttempt']);
        Route::get('/performance', [PteController::class, 'performance']);
        Route::get('/performance/branch', [PteController::class, 'branchPerformance']);
    });

    Route::prefix('accounting')->middleware(['auth:sanctum', 'role:super_admin,branch_admin,accounts'])->group(function () {
        Route::get('/accounts', [AccountingController::class, 'getAccounts']);
        Route::post('/journal-entries', [AccountingController::class, 'createJournalEntry']);
        Route::get('/journal', [AccountingController::class, 'getJournal']);
        Route::get('/ledger-summary', [AccountingController::class, 'getLedgerSummary']);
        Route::get('/ledger/{id}', [AccountingController::class, 'getLedgerAccountDetails']);
        Route::get('/audit-log', [AccountingController::class, 'getAuditLog']);
    });

    Route::prefix('finance')->middleware(['auth:sanctum', 'role:super_admin,branch_admin,accounts'])->group(function () {
        Route::post('/expense', [FinanceController::class, 'recordExpense']);
        Route::get('/stats', [FinanceController::class, 'stats']);
        Route::get('/overview', [FinanceController::class, 'overview']);
        Route::get('/report-suite', [FinanceController::class, 'reportSuite']);
        Route::get('/profit-loss', [FinanceController::class, 'profitLoss']);
        Route::get('/trial-balance', [FinanceController::class, 'trialBalance']);
        Route::get('/cashflow', [FinanceController::class, 'cashflow']);
        Route::get('/income-expense', [FinanceController::class, 'incomeExpense']);
        Route::get('/student-income', [FinanceController::class, 'studentIncome']);
        Route::get('/accounts/liquid', [FinanceController::class, 'liquidAccounts']);
        Route::post('/accounts/liquid', [FinanceController::class, 'createLiquidAccount']);
    });

    Route::prefix('invoices')->middleware(['auth:sanctum', 'role:super_admin,branch_admin,accounts'])->group(function () {
        Route::get('/stats', [InvoiceController::class, 'stats']);
        Route::get('/aging', [InvoiceController::class, 'aging']);
        Route::get('/categories/flat', [InvoiceController::class, 'categoriesFlat']);
        Route::get('/categories', [InvoiceController::class, 'categories']);
        Route::post('/categories', [InvoiceController::class, 'createCategory']);
        Route::put('/categories/{id}', [InvoiceController::class, 'updateCategory']);
        Route::delete('/categories/{id}', [InvoiceController::class, 'deleteCategory']);
        Route::get('/customers', [InvoiceController::class, 'customers']);
        Route::post('/customers', [InvoiceController::class, 'createCustomer']);
        Route::put('/customers/{id}', [InvoiceController::class, 'updateCustomer']);
        Route::delete('/customers/{id}', [InvoiceController::class, 'deleteCustomer']);
        Route::post('/{id}/pay', [InvoiceController::class, 'pay']);
        Route::get('/', [InvoiceController::class, 'index']);
        Route::post('/', [InvoiceController::class, 'store']);
        Route::put('/{id}', [InvoiceController::class, 'update']);
    });

    Route::prefix('expenses')->middleware(['auth:sanctum', 'role:super_admin,branch_admin,accounts'])->group(function () {
        Route::get('/split', [ExpenseController::class, 'split']);
        Route::get('/categories/flat', [ExpenseController::class, 'categoriesFlat']);
        Route::get('/categories', [ExpenseController::class, 'categories']);
        Route::post('/categories', [ExpenseController::class, 'createCategory']);
        Route::put('/categories/{id}', [ExpenseController::class, 'updateCategory']);
        Route::delete('/categories/{id}', [ExpenseController::class, 'deleteCategory']);
        Route::get('/', [ExpenseController::class, 'index']);
        Route::post('/', [ExpenseController::class, 'store']);
        Route::put('/{id}', [ExpenseController::class, 'update']);
        Route::put('/{id}/payment-source', [ExpenseController::class, 'selectPaymentSource']);
        Route::put('/{id}/verify', [ExpenseController::class, 'verify']);
        Route::put('/{id}/approve', [ExpenseController::class, 'approve']);
        Route::put('/{id}/reject', [ExpenseController::class, 'reject']);
        Route::delete('/{id}', [ExpenseController::class, 'destroy']);
    });

    Route::prefix('budget')->middleware(['auth:sanctum', 'role:super_admin,branch_admin,accounts'])->group(function () {
        Route::get('/vs-actual', [BudgetController::class, 'vsActual']);
        Route::get('/', [BudgetController::class, 'index']);
        Route::post('/', [BudgetController::class, 'store']);
    });

    Route::prefix('assets')->middleware(['auth:sanctum', 'role:super_admin,branch_admin'])->group(function () {
        Route::get('/stats', [AssetController::class, 'stats']);
        Route::get('/', [AssetController::class, 'index']);
        Route::post('/', [AssetController::class, 'store']);
        Route::put('/{id}', [AssetController::class, 'update']);
        Route::delete('/{id}', [AssetController::class, 'destroy']);
    });

    Route::prefix('pos')->middleware(['auth:sanctum', 'role:super_admin,branch_admin,accounts'])->group(function () {
        Route::get('/transactions', [PosController::class, 'transactions']);
        Route::get('/pending', [PosController::class, 'pending']);
        Route::post('/collect-fee', [PosController::class, 'collectFee']);
        Route::post('/collect-custom-income', [PosController::class, 'collectCustomIncome']);
        Route::post('/reject-fee', [PosController::class, 'rejectPendingInvoice']);
    });

    Route::prefix('reconciliation')->middleware(['auth:sanctum', 'role:super_admin,branch_admin,accounts'])->group(function () {
        Route::get('/stats', [ReconciliationController::class, 'stats']);
        Route::get('/dashboard', [ReconciliationController::class, 'dashboard']);
        Route::get('/reports', [ReconciliationController::class, 'reports']);
        Route::get('/accounts', [ReconciliationController::class, 'bankAccounts']);
        Route::get('/mappings', [ReconciliationController::class, 'mappings']);
        Route::post('/mappings', [ReconciliationController::class, 'createMapping']);
        Route::put('/mappings/{id}', [ReconciliationController::class, 'updateMapping']);
        Route::delete('/mappings/{id}', [ReconciliationController::class, 'deleteMapping']);
        Route::post('/generate', [ReconciliationController::class, 'generateSession']);
        Route::post('/opening-balance', [ReconciliationController::class, 'recordOpeningBalance']);
        Route::post('/collections', [ReconciliationController::class, 'recordCollection']);
        Route::post('/transfers', [ReconciliationController::class, 'recordTransfer']);
        Route::post('/closing-balance', [ReconciliationController::class, 'recordClosingBalance']);
        Route::get('/sessions', [ReconciliationController::class, 'sessions']);
        Route::get('/sessions/{id}', [ReconciliationController::class, 'sessionDetail']);
        Route::post('/sessions/{id}/review', [ReconciliationController::class, 'reviewSession']);
        Route::post('/sessions/{id}/approve', [ReconciliationController::class, 'approveSession']);
        Route::post('/sessions/{id}/reopen', [ReconciliationController::class, 'reopenSession']);
        Route::post('/sessions/{id}/lock', [ReconciliationController::class, 'lockSession']);
        Route::get('/lines/{lineId}/detail', [ReconciliationController::class, 'lineDetail']);
        Route::patch('/lines/{lineId}', [ReconciliationController::class, 'updateLineNotes']);
    });

    Route::prefix('payment')->group(function () {
        Route::get('/config', [PaymentController::class, 'config']);
        Route::post('/initiate', [PaymentController::class, 'initiate']);
        Route::post('/success', [PaymentController::class, 'success']);
        Route::post('/fail', [PaymentController::class, 'fail']);
        Route::post('/cancel', [PaymentController::class, 'cancel']);
        Route::get('/status/{reference}', [PaymentController::class, 'status']);
        Route::post('/simulate', [PaymentController::class, 'simulate'])->middleware('auth:sanctum');
    });

    Route::prefix('hrm')->middleware('auth:sanctum')->group(function () {
        Route::post('/attendance/self-checkin', [HrmController::class, 'selfCheckin']);

        Route::middleware('role:super_admin,branch_admin,hr')->group(function () {
            Route::post('/attendance/mark', [HrmController::class, 'markStaffAttendance']);
            Route::get('/attendance', [HrmController::class, 'getStaffAttendance']);
            Route::get('/attendance/summary', [HrmController::class, 'getStaffAttendanceSummary']);
            Route::get('/attendance/my', [HrmController::class, 'getMyStaffAttendance']);
            Route::get('/leave-types', [HrmController::class, 'getLeaveTypes']);
            Route::post('/leave-types', [HrmController::class, 'createLeaveType']);
            Route::get('/leaves', [HrmController::class, 'getLeaveRequests']);
            Route::post('/leaves', [HrmController::class, 'createLeaveRequest']);
            Route::patch('/leaves/{id}/approve', [HrmController::class, 'approveLeave']);
            Route::patch('/leaves/{id}/reject', [HrmController::class, 'rejectLeave']);
            Route::get('/leaves/my', [HrmController::class, 'getMyLeaves']);
            Route::get('/leaves/balance', [HrmController::class, 'getLeaveBalance']);
            Route::get('/jobs', [HrmController::class, 'getJobPostings']);
            Route::post('/jobs', [HrmController::class, 'createJobPosting']);
            Route::patch('/jobs/{id}', [HrmController::class, 'updateJobPosting']);
            Route::delete('/jobs/{id}', [HrmController::class, 'deleteJobPosting']);
            Route::get('/applicants', [HrmController::class, 'getApplicants']);
            Route::post('/applicants', [HrmController::class, 'createApplicant']);
            Route::patch('/applicants/{id}', [HrmController::class, 'updateApplicant']);
            Route::post('/applicants/{id}/hire', [HrmController::class, 'hireApplicant']);
            Route::get('/documents', [HrmController::class, 'getDocuments']);
            Route::post('/documents', [HrmController::class, 'createDocument']);
            Route::delete('/documents/{id}', [HrmController::class, 'deleteDocument']);
            Route::get('/documents/expiring', [HrmController::class, 'getExpiringDocuments']);
            Route::get('/reviews', [HrmController::class, 'getReviews']);
            Route::post('/reviews', [HrmController::class, 'createReview']);
            Route::patch('/reviews/{id}', [HrmController::class, 'updateReview']);
            Route::get('/reviews/my', [HrmController::class, 'getMyReviews']);
            Route::get('/shifts', [HrmController::class, 'getShifts']);
            Route::post('/shifts', [HrmController::class, 'createShift']);
            Route::patch('/shifts/{id}', [HrmController::class, 'updateShift']);
            Route::get('/schedules', [HrmController::class, 'getSchedules']);
            Route::post('/schedules', [HrmController::class, 'createSchedule']);
            Route::delete('/schedules/{id}', [HrmController::class, 'deleteSchedule']);
            Route::get('/org-chart', [HrmController::class, 'getOrgChart']);
            Route::get('/dashboard/stats', [HrmController::class, 'getDashboardStats']);
            Route::get('/dashboard/birthdays', [HrmController::class, 'getBirthdays']);
            Route::get('/dashboard/anniversaries', [HrmController::class, 'getAnniversaries']);
        });
    });

    Route::prefix('payroll')->middleware(['auth:sanctum', 'role:super_admin,branch_admin,hr,accounts'])->group(function () {
        Route::get('/staff', [PayrollController::class, 'getStaff']);
        Route::post('/profiles', [PayrollController::class, 'updateStaffProfile']);
        Route::patch('/staff/{id}/status', [PayrollController::class, 'updateStaffStatus']);
        Route::get('/history', [PayrollController::class, 'getPayrollHistory']);
        Route::get('/deductions', [PayrollController::class, 'getDeductions']);
        Route::post('/deductions', [PayrollController::class, 'createDeduction']);
        Route::patch('/deductions/{id}', [PayrollController::class, 'updateDeduction']);
        Route::delete('/deductions/{id}', [PayrollController::class, 'deleteDeduction']);
        Route::get('/bonuses', [PayrollController::class, 'getBonuses']);
        Route::post('/bonuses', [PayrollController::class, 'createBonus']);
        Route::patch('/bonuses/{id}', [PayrollController::class, 'updateBonus']);
        Route::delete('/bonuses/{id}', [PayrollController::class, 'deleteBonus']);
        Route::get('/teacher-sessions', [PayrollController::class, 'getTeacherSessions']);
        Route::post('/teacher-sessions', [PayrollController::class, 'createTeacherSession']);
        Route::patch('/teacher-sessions/{id}', [PayrollController::class, 'updateTeacherSession']);
        Route::delete('/teacher-sessions/{id}', [PayrollController::class, 'deleteTeacherSession']);
        Route::post('/generate', [PayrollController::class, 'generateDraftPayroll']);
        Route::post('/pay/{id}', [PayrollController::class, 'processPayment']);
        Route::post('/reopen', [PayrollController::class, 'reopenPayroll']);
    });

    Route::prefix('crm')->middleware(['auth:sanctum', 'role:super_admin,branch_admin,counselor,staff'])->group(function () {
        Route::get('/courses', [CrmController::class, 'getCourses']);
        Route::get('/leads', [CrmController::class, 'getAllLeads']);
        Route::post('/leads', [CrmController::class, 'createLead']);
        Route::put('/leads/{id}', [CrmController::class, 'updateLead']);
        Route::patch('/leads/{id}/status', [CrmController::class, 'updateLeadStatus']);
        Route::delete('/leads/{id}', [CrmController::class, 'deleteLead']);
        Route::post('/leads/{id}/convert', [CrmController::class, 'convertLead']);
        Route::post('/leads/{id}/enroll', [CrmController::class, 'enrollLead'])->middleware('throttle:critical');
        Route::post('/leads/{id}/successful', [CrmController::class, 'markSuccessful']);
        Route::get('/contacts', [CrmController::class, 'getContacts']);
        Route::post('/contacts', [CrmController::class, 'createContact']);
        Route::post('/contacts/bulk-upload', [CrmController::class, 'bulkUploadContacts']);
        Route::patch('/contacts/bulk-status', [CrmController::class, 'bulkUpdateContactLeadStatus']);
        Route::get('/contacts/{id}', [CrmController::class, 'getContact']);
        Route::put('/contacts/{id}', [CrmController::class, 'updateContact']);
        Route::delete('/contacts/{id}', [CrmController::class, 'deleteContact']);
        Route::get('/opportunities', [CrmController::class, 'getOpportunities']);
        Route::post('/opportunities', [CrmController::class, 'createOpportunity']);
        Route::put('/opportunities/{id}', [CrmController::class, 'updateOpportunity']);
        Route::delete('/opportunities/{id}', [CrmController::class, 'deleteOpportunity']);
        Route::post('/opportunities/{id}/win', [CrmController::class, 'winOpportunity']);
        Route::post('/opportunities/{id}/lose', [CrmController::class, 'loseOpportunity']);
        Route::get('/activities', [CrmController::class, 'getActivities']);
        Route::post('/activities', [CrmController::class, 'createActivity']);
        Route::patch('/activities/{id}/complete', [CrmController::class, 'completeActivity']);
        Route::get('/campaigns', [CrmController::class, 'getCampaigns']);
        Route::post('/campaigns', [CrmController::class, 'createCampaign']);
        Route::post('/campaigns/{id}/send', [CrmController::class, 'sendCampaign']);
        Route::delete('/campaigns/{id}', [CrmController::class, 'deleteCampaign']);
        Route::get('/analytics/funnel', [CrmController::class, 'getFunnel']);
        Route::get('/analytics/source', [CrmController::class, 'getSourceAnalysis']);
        Route::get('/analytics/forecast', [CrmController::class, 'getRevenueForecast']);
        Route::get('/analytics/success-results', [CrmController::class, 'getSuccessResultsAnalysis']);
        Route::get('/analytics/destination-countries', [CrmController::class, 'getSuccessDestinationAnalysis']);
    });

    Route::prefix('automation')->middleware(['auth:sanctum', 'role:super_admin'])->group(function () {
        Route::get('/', [AutomationController::class, 'index']);
        Route::post('/', [AutomationController::class, 'store']);
        Route::post('/run-birthday-check', [AutomationController::class, 'runBirthdayCheck']);
        Route::put('/{id}', [AutomationController::class, 'update']);
        Route::patch('/{id}/toggle', [AutomationController::class, 'toggle']);
        Route::delete('/{id}', [AutomationController::class, 'destroy']);
    });

    Route::prefix('notifications')->middleware('auth:sanctum')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::put('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/', [NotificationController::class, 'store'])->middleware('role:super_admin,branch_admin,staff');
    });

    Route::prefix('public')->middleware('throttle:public-api')->group(function () {
        Route::get('/tracking-config', [PublicController::class, 'trackingConfig']);
        Route::get('/branches', [PublicController::class, 'branches']);
        Route::get('/branches/{slug}', [PublicController::class, 'branchDetails']);
        Route::get('/branches/{slug}/courses', [PublicController::class, 'branchCourses']);
        Route::get('/branches/{slug}/blog', [PublicController::class, 'branchBlogs']);
        Route::get('/courses', [PublicController::class, 'courses']);
        Route::get('/courses/{slug}', [PublicController::class, 'courseDetails']);
        Route::get('/courses/{slug}/batches', [PublicController::class, 'courseBatches']);
        Route::get('/blog', [PublicController::class, 'blogs']);
        Route::get('/blog/{slug}', [PublicController::class, 'blogDetails']);
        Route::get('/resources', [PublicController::class, 'resources']);
        Route::get('/resources/{slug}', [PublicController::class, 'resourceDetails']);
        Route::post('/contact', [PublicController::class, 'submitContactForm'])->middleware('throttle:critical');
        Route::post('/enquiries', [PublicController::class, 'submitCourseEnquiry'])->middleware('throttle:critical');
        Route::post('/student-bookings', [PublicController::class, 'submitStudentBooking'])->middleware('throttle:critical');
    });

    Route::prefix('website')->middleware(['auth:sanctum', 'role:super_admin,branch_admin,hr'])->group(function () {
        Route::get('/blogs', [WebsiteController::class, 'blogs']);
        Route::post('/blogs', [WebsiteController::class, 'createBlog']);
        Route::put('/blogs/{id}', [WebsiteController::class, 'updateBlog']);
        Route::delete('/blogs/{id}', [WebsiteController::class, 'deleteBlog']);
        Route::post('/blogs/upload-image', [WebsiteController::class, 'uploadBlogImage']);
        Route::get('/courses', [WebsiteController::class, 'courses']);
        Route::post('/courses/upload-image', [WebsiteController::class, 'uploadCourseImage']);
        Route::put('/courses/{id}', [WebsiteController::class, 'updateCourse']);
        Route::get('/resources', [WebsiteController::class, 'resources']);
        Route::post('/resources', [WebsiteController::class, 'createResource']);
        Route::put('/resources/{id}', [WebsiteController::class, 'updateResource']);
        Route::delete('/resources/{id}', [WebsiteController::class, 'deleteResource']);
        Route::post('/resources/upload', [WebsiteController::class, 'uploadResourceFile']);
    });

    Route::prefix('dashboard')->middleware('auth:sanctum')->group(function () {
        Route::get('/stats', [DashboardController::class, 'stats']);
    });

    Route::prefix('reports')->middleware(['auth:sanctum', 'role:super_admin'])->group(function () {
        Route::get('/comparison', [ReportController::class, 'comparison']);
        Route::get('/trends', [ReportController::class, 'trends']);
        Route::get('/sources', [ReportController::class, 'sources']);
    });

    Route::prefix('erp')->middleware(['auth:sanctum', 'role:super_admin,branch_admin'])->group(function () {
        Route::get('/rooms', [ErpController::class, 'rooms']);
        Route::post('/rooms', [ErpController::class, 'createRoom']);
        Route::get('/bookings', [ErpController::class, 'bookings']);
        Route::post('/bookings', [ErpController::class, 'bookRoom']);
        Route::delete('/bookings/{id}', [ErpController::class, 'deleteBooking']);
    });
});

Route::any('/{legacyPath}', LegacyApiForwardController::class)->where('legacyPath', '.*');
