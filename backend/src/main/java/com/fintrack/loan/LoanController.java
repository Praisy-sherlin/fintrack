package com.fintrack.loan;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.fintrack.auth.User;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// ── Enums ─────────────────────────────────────────────────────────────────────
enum LoanStatus  { PENDING, APPROVED, ACTIVE, REJECTED, CLOSED }
enum LoanType    { PERSONAL, EMERGENCY, VEHICLE, EDUCATION, HOME }

// ── Entity ────────────────────────────────────────────────────────────────────
@Entity
@Table(name = "loans")
@EntityListeners(AuditingEntityListener.class)
@Data @Builder @NoArgsConstructor @AllArgsConstructor
class Loan {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false) private Long employeeId;
    @Column(nullable = false) private String employeeName;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private LoanType type;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private Integer tenureMonths;

    @Column(precision = 6, scale = 2)
    private BigDecimal interestRate;

    @Column(precision = 12, scale = 2)
    private BigDecimal emiAmount;

    @Column(precision = 12, scale = 2)
    private BigDecimal remainingAmount;

    @Column(nullable = false)
    private Integer paidInstallments;

    private String purpose;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private LoanStatus status = LoanStatus.PENDING;

    private String remarks;
    private Long approvedBy;
    private LocalDate disbursedDate;

    @CreatedDate @Column(updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate                       private LocalDateTime updatedAt;
}

// ── Repository ────────────────────────────────────────────────────────────────
@Repository
interface LoanRepository extends JpaRepository<Loan, Long> {
    Page<Loan> findByEmployeeId(Long employeeId, Pageable pageable);
    List<Loan> findByStatusAndDisbursedDateBefore(LoanStatus status, LocalDate date);
    long countByStatus(LoanStatus status);
}

// ── DTOs ──────────────────────────────────────────────────────────────────────
record LoanDto(Long id, Long employeeId, String employeeName, String type,
               BigDecimal amount, Integer tenureMonths, BigDecimal interestRate,
               BigDecimal emiAmount, BigDecimal remainingAmount, Integer paidInstallments,
               String purpose, String status, LocalDate disbursedDate) {}

record ApplyLoanRequest(String type, BigDecimal amount, Integer tenureMonths,
                        BigDecimal interestRate, String purpose) {}

record ApproveRejectRequest(String remarks) {}

record EmiRequest(BigDecimal amount, BigDecimal interestRate, Integer tenureMonths) {}

record RepaymentScheduleItem(int installmentNo, LocalDate dueDate, BigDecimal emi,
                              BigDecimal principal, BigDecimal interest, BigDecimal balance) {}

// ── Service ───────────────────────────────────────────────────────────────────
@Service
@RequiredArgsConstructor
@Transactional
class LoanService {

    private final LoanRepository repo;

    public Page<LoanDto> getAll(Pageable pageable) {
        return repo.findAll(pageable).map(this::toDto);
    }

    public LoanDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    public LoanDto apply(Long employeeId, String employeeName, ApplyLoanRequest req) {
        LoanType type = LoanType.valueOf(req.type().toUpperCase());
        BigDecimal rate = req.interestRate() != null ? req.interestRate() : new BigDecimal("8.5");
        BigDecimal emi  = calculateEMI(req.amount(), rate, req.tenureMonths());

        Loan loan = Loan.builder()
            .employeeId(employeeId).employeeName(employeeName)
            .type(type).amount(req.amount())
            .tenureMonths(req.tenureMonths())
            .interestRate(rate).emiAmount(emi)
            .remainingAmount(req.amount())
            .paidInstallments(0)
            .purpose(req.purpose())
            .status(LoanStatus.PENDING)
            .build();

        return toDto(repo.save(loan));
    }

    public LoanDto approve(Long id, Long approverId, String remarks) {
        Loan loan = findOrThrow(id);
        loan.setStatus(LoanStatus.ACTIVE);
        loan.setApprovedBy(approverId);
        loan.setDisbursedDate(LocalDate.now());
        loan.setRemarks(remarks);
        return toDto(repo.save(loan));
    }

    public LoanDto reject(Long id, Long approverId, String remarks) {
        Loan loan = findOrThrow(id);
        loan.setStatus(LoanStatus.REJECTED);
        loan.setApprovedBy(approverId);
        loan.setRemarks(remarks);
        return toDto(repo.save(loan));
    }

    public List<RepaymentScheduleItem> getRepaymentSchedule(Long id) {
        Loan loan = findOrThrow(id);
        List<RepaymentScheduleItem> schedule = new ArrayList<>();
        BigDecimal balance = loan.getAmount();
        BigDecimal monthlyRate = loan.getInterestRate()
            .divide(new BigDecimal("1200"), 10, RoundingMode.HALF_UP);
        LocalDate dueDate = loan.getDisbursedDate() != null
            ? loan.getDisbursedDate().plusMonths(1)
            : LocalDate.now().plusMonths(1);

        for (int i = 1; i <= loan.getTenureMonths(); i++) {
            BigDecimal interest = balance.multiply(monthlyRate).setScale(2, RoundingMode.HALF_UP);
            BigDecimal principal = loan.getEmiAmount().subtract(interest);
            balance = balance.subtract(principal).max(BigDecimal.ZERO);
            schedule.add(new RepaymentScheduleItem(i, dueDate, loan.getEmiAmount(), principal, interest, balance));
            dueDate = dueDate.plusMonths(1);
        }
        return schedule;
    }

    public record EmiResult(BigDecimal emi, BigDecimal totalPayable, BigDecimal totalInterest) {}

    public EmiResult calculateEMIResult(EmiRequest req) {
        BigDecimal emi = calculateEMI(req.amount(), req.interestRate(), req.tenureMonths());
        BigDecimal totalPayable = emi.multiply(new BigDecimal(req.tenureMonths()));
        BigDecimal totalInterest = totalPayable.subtract(req.amount());
        return new EmiResult(emi, totalPayable, totalInterest);
    }

    private BigDecimal calculateEMI(BigDecimal principal, BigDecimal annualRate, int months) {
        BigDecimal r = annualRate.divide(new BigDecimal("1200"), 10, RoundingMode.HALF_UP);
        BigDecimal onePlusR = BigDecimal.ONE.add(r);
        BigDecimal pow = onePlusR.pow(months, new MathContext(15));
        return principal.multiply(r).multiply(pow)
            .divide(pow.subtract(BigDecimal.ONE), 2, RoundingMode.HALF_UP);
    }

    private Loan findOrThrow(Long id) {
        return repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Loan not found: " + id));
    }

    private LoanDto toDto(Loan l) {
        return new LoanDto(l.getId(), l.getEmployeeId(), l.getEmployeeName(), l.getType().name(),
            l.getAmount(), l.getTenureMonths(), l.getInterestRate(), l.getEmiAmount(),
            l.getRemainingAmount(), l.getPaidInstallments(), l.getPurpose(),
            l.getStatus().name(), l.getDisbursedDate());
    }
}

// ── Controller ────────────────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService service;

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(service.getAll(PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoanDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping("/apply")
    public ResponseEntity<LoanDto> apply(
            @RequestBody ApplyLoanRequest req,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(201).body(service.apply(user.getId(), user.getName(), req));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<LoanDto> approve(
            @PathVariable Long id,
            @RequestBody(required = false) ApproveRejectRequest body,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.approve(id, user.getId(), body != null ? body.remarks() : "Approved"));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<LoanDto> reject(
            @PathVariable Long id,
            @RequestBody(required = false) ApproveRejectRequest body,
            @AuthenticationPrincipal User user) {
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
