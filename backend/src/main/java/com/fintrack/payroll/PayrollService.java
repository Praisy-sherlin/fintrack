package com.fintrack.payroll;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PayrollService {
    private final PayrollRepository repo;

    private record MockEmployee(Long id, String name, String department, BigDecimal salary) {}
    private static final List<MockEmployee> MOCK_EMPLOYEES = List.of(
        new MockEmployee(1L, "Arjun Kumar",  "Finance",     new BigDecimal("120000")),
        new MockEmployee(2L, "Priya Sharma", "Engineering", new BigDecimal("145000")),
        new MockEmployee(3L, "Rajesh Mehta", "HR",          new BigDecimal("110000")),
        new MockEmployee(4L, "Meena Reddy",  "Engineering", new BigDecimal("130000")),
        new MockEmployee(5L, "Vikram Singh", "Engineering", new BigDecimal("180000"))
    );

    public Page<PayrollDto> getAll(int month, int year, Pageable pageable) {
        return repo.findByMonthAndYear(month, year, pageable).map(this::toDto);
    }

    public PayrollDto getById(Long id) { return toDto(findOrThrow(id)); }

    public List<PayrollDto> processPayroll(ProcessPayrollRequest req) {
        return MOCK_EMPLOYEES.stream()
            .filter(e -> req.department() == null || req.department().isBlank() || req.department().equals(e.department()))
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
        r.setStatus(PayrollStatus.PAID); r.setApprovedDate(LocalDateTime.now());
        return toDto(repo.save(r));
    }

    public PayrollDto reject(Long id, String remarks) {
        PayrollRecord r = findOrThrow(id);
        r.setStatus(PayrollStatus.REJECTED); r.setRemarks(remarks);
        return toDto(repo.save(r));
    }

    public PayrollSummaryDto getSummary(int month, int year) {
        BigDecimal totalNet = repo.sumNetSalaryByMonthAndYear(month, year).orElse(BigDecimal.ZERO);
        BigDecimal totalTds = repo.sumTdsByMonthAndYear(month, year).orElse(BigDecimal.ZERO);
        long pending = repo.countByStatus(PayrollStatus.PENDING);
        long total = repo.findByMonthAndYear(month, year, PageRequest.of(0, Integer.MAX_VALUE)).getTotalElements();
        return new PayrollSummaryDto(totalNet.add(totalTds), totalNet, totalTds, pending, total);
    }

    private PayrollRecord findOrThrow(Long id) {
        return repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Payroll record not found: " + id));
    }

    public PayrollDto toDto(PayrollRecord r) {
        return new PayrollDto(r.getId(), r.getEmployeeId(), r.getEmployeeName(), r.getDepartment(),
            r.getMonth(), r.getYear(), r.getBasicSalary(), r.getHra(), r.getDa(),
            r.getGrossSalary(), r.getPf(), r.getTds(), r.getNetSalary(),
            r.getStatus().name(), r.getRemarks(), r.getProcessedDate());
    }
}
