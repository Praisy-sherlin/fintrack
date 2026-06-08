package com.fintrack.payroll;

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
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

// ── Enums ─────────────────────────────────────────────────────────────────────
enum PayrollStatus { DRAFT, PROCESSING, PENDING, PAID, REJECTED }

// ── Entity ────────────────────────────────────────────────────────────────────
@Entity
@Table(name = "payroll_records",
       uniqueConstraints = @UniqueConstraint(columnNames = {"employee_id", "month", "year"}))
@EntityListeners(AuditingEntityListener.class)
@Data @Builder @NoArgsConstructor @AllArgsConstructor
class PayrollRecord {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(nullable = false)
    private String employeeName;

    private String department;

    @Column(nullable = false)
    private Integer month;

    @Column(nullable = false)
    private Integer year;

    @Column(precision = 12, scale = 2)
    private BigDecimal basicSalary;

    @Column(precision = 12, scale = 2)
    private BigDecimal hra;         // 40% of basic

    @Column(precision = 12, scale = 2)
    private BigDecimal da;          // 10% of basic

    @Column(precision = 12, scale = 2)
    private BigDecimal grossSalary; // basic + hra + da

    @Column(precision = 12, scale = 2)
    private BigDecimal pf;          // 12% of basic

    @Column(precision = 12, scale = 2)
    private BigDecimal tds;         // ~10% of gross

    @Column(precision = 12, scale = 2)
    private BigDecimal netSalary;   // gross - pf - tds

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PayrollStatus status = PayrollStatus.PENDING;

    private String remarks;

    private LocalDateTime processedDate;
    private LocalDateTime approvedDate;

    @CreatedDate @Column(updatable = false)
    private LocalDateTime createdAt;
    @LastModifiedDate
    private LocalDateTime updatedAt;
}

// ── Repository ────────────────────────────────────────────────────────────────
@Repository
interface PayrollRepository extends JpaRepository<PayrollRecord, Long> {
    Page<PayrollRecord> findByMonthAndYear(int month, int year, Pageable pageable);
    List<PayrollRecord> findByEmployeeId(Long employeeId);
    boolean existsByEmployeeIdAndMonthAndYear(Long employeeId, int month, int year);
    long countByStatus(PayrollStatus status);

    @Query("SELECT SUM(p.netSalary) FROM PayrollRecord p WHERE p.month = :month AND p.year = :year")
    Optional<BigDecimal> sumNetSalaryByMonthAndYear(int month, int year);

    @Query("SELECT SUM(p.tds) FROM PayrollRecord p WHERE p.month = :month AND p.year = :year")
    Optional<BigDecimal> sumTdsByMonthAndYear(int month, int year);
}

// ── DTOs ──────────────────────────────────────────────────────────────────────
record PayrollDto(Long id, Long employeeId, String employeeName, String department,
                  int month, int year, BigDecimal basicSalary, BigDecimal hra, BigDecimal da,
                  BigDecimal grossSalary, BigDecimal pf, BigDecimal tds, BigDecimal netSalary,
                  String status, String remarks, LocalDateTime processedDate) {}

record ProcessPayrollRequest(int month, int year, String department) {}

record PayrollSummaryDto(BigDecimal totalGross, BigDecimal totalNet,
                         BigDecimal totalTds, long pendingCount, long totalCount) {}

// ── Service ───────────────────────────────────────────────────────────────────
@Service
@RequiredArgsConstructor
@Transactional
class PayrollService {

    private final PayrollRepository repo;

    // Simulate fetching employees (would be injected from EmployeeService in full implementation)
    private static final List<MockEmployee> MOCK_EMPLOYEES = List.of(
        new MockEmployee(1L, "Arjun Kumar",   "Finance",     new BigDecimal("120000")),
        new MockEmployee(2L, "Priya Sharma",  "Engineering", new BigDecimal("145000")),
        new MockEmployee(3L, "Rajesh Mehta",  "HR",          new BigDecimal("110000")),
        new MockEmployee(4L, "Meena Reddy",   "Engineering", new BigDecimal("130000")),
        new MockEmployee(5L, "Vikram Singh",  "Engineering", new BigDecimal("180000"))
    );

    public Page<PayrollDto> getAll(int month, int year, Pageable pageable) {
        return repo.findByMonthAndYear(month, year, pageable).map(this::toDto);
    }

    public PayrollDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    public List<PayrollDto> processPayroll(ProcessPayrollRequest req) {
        return MOCK_EMPLOYEES.stream()
            .filter(e -> req.department() == null || req.department().isBlank()
                      || req.department().equals(e.department()))
            .filter(e -> !repo.existsByEmployeeIdAndMonthAndYear(e.id(), req.month(), req.year()))
            .map(e -> {
                BigDecimal basic = e.salary();
                BigDecimal hra   = basic.multiply(new BigDecimal("0.40")).setScale(2, RoundingMode.HALF_UP);
                BigDecimal da    = basic.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP);
                BigDecimal gross = basic.add(hra).add(da);
                BigDecimal pf    = basic.multiply(new BigDecimal("0.12")).setScale(2, RoundingMode.HALF_UP);
                BigDecimal tds   = gross.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP);
                BigDecimal net   = gross.subtract(pf).subtract(tds);

                PayrollRecord record = PayrollRecord.builder()
                    .employeeId(e.id()).employeeName(e.name()).department(e.department())
                    .month(req.month()).year(req.year())
                    .basicSalary(basic).hra(hra).da(da).grossSalary(gross)
                    .pf(pf).tds(tds).netSalary(net)
                    .status(PayrollStatus.PENDING)
                    .processedDate(LocalDateTime.now())
                    .build();

                return toDto(repo.save(record));
            }).toList();
    }

    public PayrollDto approve(Long id) {
        PayrollRecord r = findOrThrow(id);
        r.setStatus(PayrollStatus.PAID);
        r.setApprovedDate(LocalDateTime.now());
        return toDto(repo.save(r));
    }

    public PayrollDto reject(Long id, String remarks) {
        PayrollRecord r = findOrThrow(id);
        r.setStatus(PayrollStatus.REJECTED);
        r.setRemarks(remarks);
        return toDto(repo.save(r));
    }

    public PayrollSummaryDto getSummary(int month, int year) {
        BigDecimal totalNet = repo.sumNetSalaryByMonthAndYear(month, year).orElse(BigDecimal.ZERO);
        BigDecimal totalTds = repo.sumTdsByMonthAndYear(month, year).orElse(BigDecimal.ZERO);
        long pending = repo.countByStatus(PayrollStatus.PENDING);
        long total   = repo.findByMonthAndYear(month, year, PageRequest.of(0, Integer.MAX_VALUE)).getTotalElements();
        return new PayrollSummaryDto(totalNet.add(totalTds), totalNet, totalTds, pending, total);
    }

    private PayrollRecord findOrThrow(Long id) {
        return repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Payroll record not found: " + id));
    }

    private PayrollDto toDto(PayrollRecord r) {
        return new PayrollDto(r.getId(), r.getEmployeeId(), r.getEmployeeName(), r.getDepartment(),
            r.getMonth(), r.getYear(), r.getBasicSalary(), r.getHra(), r.getDa(),
            r.getGrossSalary(), r.getPf(), r.getTds(), r.getNetSalary(),
            r.getStatus().name(), r.getRemarks(), r.getProcessedDate());
    }

    record MockEmployee(Long id, String name, String department, BigDecimal salary) {}
}

// ── Controller ────────────────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/payroll")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService service;

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(defaultValue = "6")  int month,
            @RequestParam(defaultValue = "2026") int year,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(service.getAll(month, year, PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PayrollDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping("/process")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<List<PayrollDto>> process(@RequestBody ProcessPayrollRequest req) {
        return ResponseEntity.ok(service.processPayroll(req));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<PayrollDto> approve(@PathVariable Long id) {
        return ResponseEntity.ok(service.approve(id));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<PayrollDto> reject(@PathVariable Long id,
            @RequestParam(defaultValue = "Rejected") String remarks) {
        return ResponseEntity.ok(service.reject(id, remarks));
    }

    @GetMapping("/summary")
    public ResponseEntity<PayrollSummaryDto> summary(
            @RequestParam(defaultValue = "6")    int month,
            @RequestParam(defaultValue = "2026") int year) {
        return ResponseEntity.ok(service.getSummary(month, year));
    }
}
