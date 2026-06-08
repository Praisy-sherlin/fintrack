package com.fintrack.expense;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.fintrack.auth.User;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

// ── Enum ──────────────────────────────────────────────────────────────────────
enum ExpenseStatus { SUBMITTED, PENDING, APPROVED, REJECTED }
enum ExpenseCategory { TRAVEL, MEALS, OFFICE_SUPPLIES, TRAINING, EQUIPMENT, OTHER }

// ── Entity ────────────────────────────────────────────────────────────────────
@Entity
@Table(name = "expenses")
@EntityListeners(AuditingEntityListener.class)
@Data @Builder @NoArgsConstructor @AllArgsConstructor
class Expense {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long employeeId;

    @Column(nullable = false)
    private String employeeName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpenseCategory category;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    private String receiptUrl;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ExpenseStatus status = ExpenseStatus.PENDING;

    private String remarks;

    private Long approvedBy;
    private LocalDateTime approvedAt;

    private LocalDate submittedDate;

    @CreatedDate @Column(updatable = false)
    private LocalDateTime createdAt;
    @LastModifiedDate
    private LocalDateTime updatedAt;
}

// ── Repository ────────────────────────────────────────────────────────────────
@Repository
interface ExpenseRepository extends JpaRepository<Expense, Long> {
    Page<Expense> findByEmployeeId(Long employeeId, Pageable pageable);
    Page<Expense> findByStatus(ExpenseStatus status, Pageable pageable);
    Page<Expense> findByEmployeeIdAndStatus(Long employeeId, ExpenseStatus status, Pageable pageable);
    long countByStatus(ExpenseStatus status);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.status = :status")
    Optional<BigDecimal> sumAmountByStatus(ExpenseStatus status);
}

// ── DTOs ──────────────────────────────────────────────────────────────────────
record ExpenseDto(Long id, Long employeeId, String employeeName, String category,
                  String description, BigDecimal amount, String receiptUrl,
                  String status, String remarks, LocalDate submittedDate, LocalDateTime approvedAt) {}

record SubmitExpenseRequest(String category, String description, BigDecimal amount) {}
record ApproveRejectRequest(String remarks) {}

// ── Service ───────────────────────────────────────────────────────────────────
@Service
@RequiredArgsConstructor
@Transactional
class ExpenseService {

    private final ExpenseRepository repo;

    public Page<ExpenseDto> getAll(Long employeeId, String status, Pageable pageable) {
        if (employeeId != null && status != null) {
            return repo.findByEmployeeIdAndStatus(employeeId, ExpenseStatus.valueOf(status), pageable).map(this::toDto);
        } else if (employeeId != null) {
            return repo.findByEmployeeId(employeeId, pageable).map(this::toDto);
        } else if (status != null) {
            return repo.findByStatus(ExpenseStatus.valueOf(status), pageable).map(this::toDto);
        }
        return repo.findAll(pageable).map(this::toDto);
    }

    public ExpenseDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    public ExpenseDto submit(Long employeeId, String employeeName, SubmitExpenseRequest req) {
        ExpenseCategory cat;
        try { cat = ExpenseCategory.valueOf(req.category().toUpperCase().replace(" ", "_")); }
        catch (IllegalArgumentException e) { cat = ExpenseCategory.OTHER; }

        Expense expense = Expense.builder()
            .employeeId(employeeId)
            .employeeName(employeeName)
            .category(cat)
            .description(req.description())
            .amount(req.amount())
            .status(ExpenseStatus.PENDING)
            .submittedDate(LocalDate.now())
            .build();

        return toDto(repo.save(expense));
    }

    public ExpenseDto approve(Long id, Long approverId, String remarks) {
        Expense expense = findOrThrow(id);
        if (expense.getStatus() != ExpenseStatus.PENDING) {
            throw new IllegalStateException("Only pending expenses can be approved");
        }
        expense.setStatus(ExpenseStatus.APPROVED);
        expense.setApprovedBy(approverId);
        expense.setApprovedAt(LocalDateTime.now());
        expense.setRemarks(remarks);
        return toDto(repo.save(expense));
    }

    public ExpenseDto reject(Long id, Long approverId, String remarks) {
        Expense expense = findOrThrow(id);
        expense.setStatus(ExpenseStatus.REJECTED);
        expense.setApprovedBy(approverId);
        expense.setApprovedAt(LocalDateTime.now());
        expense.setRemarks(remarks);
        return toDto(repo.save(expense));
    }

    public record ExpenseSummary(BigDecimal totalPending, BigDecimal totalApproved,
                                 long pendingCount, long approvedCount) {}

    public ExpenseSummary getSummary() {
        return new ExpenseSummary(
            repo.sumAmountByStatus(ExpenseStatus.PENDING).orElse(BigDecimal.ZERO),
            repo.sumAmountByStatus(ExpenseStatus.APPROVED).orElse(BigDecimal.ZERO),
            repo.countByStatus(ExpenseStatus.PENDING),
            repo.countByStatus(ExpenseStatus.APPROVED)
        );
    }

    private Expense findOrThrow(Long id) {
        return repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Expense not found: " + id));
    }

    private ExpenseDto toDto(Expense e) {
        return new ExpenseDto(e.getId(), e.getEmployeeId(), e.getEmployeeName(),
            e.getCategory().name(), e.getDescription(), e.getAmount(),
            e.getReceiptUrl(), e.getStatus().name(), e.getRemarks(),
            e.getSubmittedDate(), e.getApprovedAt());
    }
}

// ── Controller ────────────────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService service;

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(service.getAll(employeeId, status, PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<ExpenseDto> submit(
            @RequestBody SubmitExpenseRequest req,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(201).body(service.submit(user.getId(), user.getName(), req));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ExpenseDto> approve(
            @PathVariable Long id,
            @RequestBody(required = false) ApproveRejectRequest body,
            @AuthenticationPrincipal User user) {
        String remarks = body != null ? body.remarks() : "Approved";
        return ResponseEntity.ok(service.approve(id, user.getId(), remarks));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ExpenseDto> reject(
            @PathVariable Long id,
            @RequestBody(required = false) ApproveRejectRequest body,
            @AuthenticationPrincipal User user) {
        String remarks = body != null ? body.remarks() : "Rejected";
        return ResponseEntity.ok(service.reject(id, user.getId(), remarks));
    }

    @GetMapping("/summary")
    public ResponseEntity<ExpenseService.ExpenseSummary> summary() {
        return ResponseEntity.ok(service.getSummary());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> categories() {
        return ResponseEntity.ok(List.of("Travel", "Meals", "Office Supplies", "Training", "Equipment", "Other"));
    }
}
