package com.fintrack.compliance;

import com.fintrack.audit.AuditLog;
import com.fintrack.audit.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/compliance")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','AUDITOR','MANAGER')")
public class ComplianceController {

    private final AuditService auditService;

    @GetMapping("/deadlines")
    public ResponseEntity<List<Map<String, Object>>> deadlines() {
        return ResponseEntity.ok(List.of(
            Map.of("title", "TDS payment",      "due", "2026-06-09", "amount", "₹6,40,000",
                   "status", "URGENT",   "form", "26QB"),
            Map.of("title", "Form 16 issuance", "due", "2026-06-15", "amount", "All employees",
                   "status", "UPCOMING", "form", "Form 16"),
            Map.of("title", "EPFO contribution","due", "2026-06-15", "amount", "₹3,20,000",
                   "status", "UPCOMING", "form", "ECR"),
            Map.of("title", "ESI contribution", "due", "2026-06-21", "amount", "₹48,000",
                   "status", "UPCOMING", "form", "ESI"),
            Map.of("title", "Advance tax Q1",   "due", "2026-06-15", "amount", "₹2,10,000",
                   "status", "UPCOMING", "form", "Challan 280")
        ));
    }

    @GetMapping("/tds")
    public ResponseEntity<Map<String, Object>> tdsReport(
            @RequestParam(defaultValue = "6")    int month,
            @RequestParam(defaultValue = "2026") int year) {
        return ResponseEntity.ok(Map.of(
            "month", month, "year", year,
            "totalTDS",      new BigDecimal("640000"),
            "totalGross",    new BigDecimal("4820000"),
            "employeeCount", 168,
            "status", "PENDING",
            "dueDate", "2026-06-09"
        ));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<Page<AuditLog>> auditLogs(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(auditService.getAll(page, size));
    }

    @GetMapping("/form16/{employeeId}")
    public ResponseEntity<Map<String, Object>> form16(
            @PathVariable Long employeeId,
            @RequestParam(defaultValue = "2026") int year) {
        // In production: generate actual PDF using iText
        return ResponseEntity.ok(Map.of(
            "employeeId", employeeId,
            "financialYear", (year - 1) + "-" + year,
            "grossSalary",   new BigDecimal("2070000"),
            "totalTDS",      new BigDecimal("207000"),
            "status", "READY"
        ));
    }
}
