package com.fintrack.expense;

import com.fintrack.auth.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {
    private final ExpenseService service;

    @GetMapping
    public ResponseEntity<?> list(@RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(service.getAll(employeeId, status, PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<ExpenseDto> submit(@RequestBody SubmitExpenseRequest req,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(201).body(service.submit(user.getId(), user.getName(), req));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ExpenseDto> approve(@PathVariable Long id,
            @RequestBody(required = false) ApproveRejectRequest body, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.approve(id, user.getId(), body != null ? body.remarks() : "Approved"));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ExpenseDto> reject(@PathVariable Long id,
            @RequestBody(required = false) ApproveRejectRequest body, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.reject(id, user.getId(), body != null ? body.remarks() : "Rejected"));
    }

    @GetMapping("/summary")
    public ResponseEntity<ExpenseService.ExpenseSummary> summary() { return ResponseEntity.ok(service.getSummary()); }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> categories() {
        return ResponseEntity.ok(List.of("Travel", "Meals", "Office Supplies", "Training", "Equipment", "Other"));
    }
}
