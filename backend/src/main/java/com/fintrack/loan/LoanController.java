package com.fintrack.loan;

import com.fintrack.auth.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
public class LoanController {
    private final LoanService service;

    @GetMapping
    public ResponseEntity<?> list(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(service.getAll(PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoanDto> getById(@PathVariable Long id) { return ResponseEntity.ok(service.getById(id)); }

    @PostMapping("/apply")
    public ResponseEntity<LoanDto> apply(@RequestBody ApplyLoanRequest req, @AuthenticationPrincipal User user) {
        return ResponseEntity.status(201).body(service.apply(user.getId(), user.getName(), req));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<LoanDto> approve(@PathVariable Long id,
            @RequestBody(required = false) LoanApproveRejectRequest body, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.approve(id, user.getId(), body != null ? body.remarks() : "Approved"));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<LoanDto> reject(@PathVariable Long id,
            @RequestBody(required = false) LoanApproveRejectRequest body, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.reject(id, user.getId(), body != null ? body.remarks() : "Rejected"));
    }

    @GetMapping("/{id}/schedule")
    public ResponseEntity<List<RepaymentScheduleItem>> schedule(@PathVariable Long id) {
        return ResponseEntity.ok(service.getRepaymentSchedule(id));
    }

    @PostMapping("/calculate-emi")
    public ResponseEntity<LoanService.EmiResult> calculateEMI(@RequestBody EmiRequest req) {
        return ResponseEntity.ok(service.calculateEMIResult(req));
    }

    @GetMapping("/types")
    public ResponseEntity<List<String>> types() {
        return ResponseEntity.ok(List.of("Personal", "Emergency", "Vehicle", "Education", "Home"));
    }
}
