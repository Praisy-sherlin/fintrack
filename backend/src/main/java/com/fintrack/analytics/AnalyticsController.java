package com.fintrack.analytics;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

// ── DTOs ──────────────────────────────────────────────────────────────────────
record DashboardKpis(BigDecimal totalPayroll, double payrollChange,
                     BigDecimal expenseClaims, long pendingClaims,
                     BigDecimal activeLoans, long loanCount,
                     BigDecimal tdsDeducted, double tdsChange) {}

record TrendPoint(String month, BigDecimal amount) {}

record KpisResponse(DashboardKpis kpis, List<TrendPoint> payrollTrend,
                    List<Map<String, Object>> recentTransactions,
                    Map<String, Object> payrollProgress,
                    List<Map<String, Object>> complianceAlerts) {}

// ── Controller ────────────────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    /**
     * Dashboard endpoint — returns all KPIs, payroll trend and recent transactions.
     * In production this would aggregate from payroll, expense and loan repositories.
     * Returning representative data here so the frontend dashboard renders correctly.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<KpisResponse> dashboard() {

        DashboardKpis kpis = new DashboardKpis(
            new BigDecimal("4820000"), 3.4,
            new BigDecimal("370000"),  24,
            new BigDecimal("1210000"), 8,
            new BigDecimal("640000"),  -1.1
        );

        List<TrendPoint> trend = List.of(
            new TrendPoint("Jan", new BigDecimal("4200000")),
            new TrendPoint("Feb", new BigDecimal("4350000")),
            new TrendPoint("Mar", new BigDecimal("4280000")),
            new TrendPoint("Apr", new BigDecimal("4500000")),
            new TrendPoint("May", new BigDecimal("4680000")),
            new TrendPoint("Jun", new BigDecimal("4820000"))
        );

        List<Map<String, Object>> transactions = List.of(
            Map.of("id", 1, "type", "PAYROLL", "description", "June salary — Engineering",
                   "meta", "42 employees", "date", "2026-06-05", "status", "PAID",
                   "amount", 1840000, "credit", true),
            Map.of("id", 2, "type", "EXPENSE", "description", "Expense reimbursement batch",
                   "meta", "Rajesh M, Priya S +5", "date", "2026-06-04", "status", "PROCESSING",
                   "amount", 47200, "credit", false),
            Map.of("id", 3, "type", "LOAN", "description", "Loan disbursement — Personal",
                   "meta", "Meena R", "date", "2026-06-03", "status", "PAID",
                   "amount", 250000, "credit", false),
            Map.of("id", 4, "type", "TDS", "description", "TDS remittance — May",
                   "meta", "Income Tax Dept", "date", "2026-06-01", "status", "PENDING",
                   "amount", 640000, "credit", false)
        );

        Map<String, Object> progress = Map.of(
            "processed", 142, "total", 168,
            "budgetUsed", 4050000, "budgetTotal", 4820000,
            "tdsCollected", 520000, "tdsTotal", 640000
        );

        List<Map<String, Object>> alerts = List.of(
            Map.of("id", 1, "severity", "high",   "title", "TDS due in 3 days",
                   "description", "₹6.4L due by 09 Jun", "icon", "alert-circle"),
            Map.of("id", 2, "severity", "medium", "title", "Form 16 deadline",
                   "description", "Issue by 15 Jun 2026", "icon", "clock"),
            Map.of("id", 3, "severity", "info",   "title", "24 expense claims",
                   "description", "Awaiting your approval", "icon", "info-circle")
        );

        return ResponseEntity.ok(new KpisResponse(kpis, trend, transactions, progress, alerts));
    }

    @GetMapping("/payroll-trend")
    public ResponseEntity<List<TrendPoint>> payrollTrend(
            @RequestParam(defaultValue = "6") int months) {
        return ResponseEntity.ok(List.of(
            new TrendPoint("Jan", new BigDecimal("4200000")),
            new TrendPoint("Feb", new BigDecimal("4350000")),
            new TrendPoint("Mar", new BigDecimal("4280000")),
            new TrendPoint("Apr", new BigDecimal("4500000")),
            new TrendPoint("May", new BigDecimal("4680000")),
            new TrendPoint("Jun", new BigDecimal("4820000"))
        ));
    }

    @GetMapping("/expense-breakdown")
    public ResponseEntity<List<Map<String, Object>>> expenseBreakdown() {
        return ResponseEntity.ok(List.of(
            Map.of("name", "Travel",          "value", 180000, "color", "#3b82f6"),
            Map.of("name", "Training",         "value",  95000, "color", "#8b5cf6"),
            Map.of("name", "Meals",            "value",  54000, "color", "#f59e0b"),
            Map.of("name", "Office Supplies",  "value",  38000, "color", "#10b981"),
            Map.of("name", "Equipment",        "value",  72000, "color", "#ef4444")
        ));
    }

    @GetMapping("/tax-summary")
    public ResponseEntity<Map<String, Object>> taxSummary(
            @RequestParam(defaultValue = "2026") int year) {
        return ResponseEntity.ok(Map.of(
            "year",        year,
            "totalTDS",    new BigDecimal("3840000"),
            "totalGross",  new BigDecimal("57840000"),
            "effectiveRate", 6.64,
            "q1TDS", 960000, "q2TDS", 980000, "q3TDS", 950000, "q4TDS", 950000
        ));
    }

    @GetMapping("/budget")
    public ResponseEntity<List<Map<String, Object>>> budget() {
        return ResponseEntity.ok(List.of(
            Map.of("dept", "Engineering", "budget", 2200000, "actual", 1980000),
            Map.of("dept", "Finance",     "budget",  800000, "actual",  760000),
            Map.of("dept", "HR",          "budget",  600000, "actual",  620000),
            Map.of("dept", "Sales",       "budget",  950000, "actual",  870000),
            Map.of("dept", "Marketing",   "budget",  550000, "actual",  510000)
        ));
    }

    @GetMapping("/headcount")
    public ResponseEntity<List<Map<String, Object>>> headcount() {
        return ResponseEntity.ok(List.of(
            Map.of("month", "Jan", "count", 148),
            Map.of("month", "Feb", "count", 151),
            Map.of("month", "Mar", "count", 155),
            Map.of("month", "Apr", "count", 158),
            Map.of("month", "May", "count", 162),
            Map.of("month", "Jun", "count", 168)
        ));
    }
}
