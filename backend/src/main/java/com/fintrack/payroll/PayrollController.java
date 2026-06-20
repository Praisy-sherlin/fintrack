package com.fintrack.payroll;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/payroll")
@RequiredArgsConstructor
public class PayrollController {
    private final PayrollService service;

    @GetMapping
    public ResponseEntity<?> list(@RequestParam(defaultValue = "6") int month,
            @RequestParam(defaultValue = "2026") int year,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(service.getAll(month, year, PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PayrollDto> getById(@PathVariable Long id) { return ResponseEntity.ok(service.getById(id)); }

    @PostMapping("/process")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<List<PayrollDto>> process(@RequestBody ProcessPayrollRequest req) {
        return ResponseEntity.ok(service.processPayroll(req));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<PayrollDto> approve(@PathVariable Long id) { return ResponseEntity.ok(service.approve(id)); }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<PayrollDto> reject(@PathVariable Long id,
            @RequestParam(defaultValue = "Rejected") String remarks) {
        return ResponseEntity.ok(service.reject(id, remarks));
    }

    @GetMapping("/summary")
    public ResponseEntity<PayrollSummaryDto> summary(@RequestParam(defaultValue = "6") int month,
            @RequestParam(defaultValue = "2026") int year) {
        return ResponseEntity.ok(service.getSummary(month, year));
    }
}
