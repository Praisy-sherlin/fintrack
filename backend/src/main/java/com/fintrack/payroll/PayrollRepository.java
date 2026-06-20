package com.fintrack.payroll;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<PayrollRecord, Long> {
    Page<PayrollRecord> findByMonthAndYear(int month, int year, Pageable pageable);
    boolean existsByEmployeeIdAndMonthAndYear(Long employeeId, int month, int year);
    long countByStatus(PayrollStatus status);
    @Query("SELECT SUM(p.netSalary) FROM PayrollRecord p WHERE p.month = :month AND p.year = :year")
    Optional<BigDecimal> sumNetSalaryByMonthAndYear(int month, int year);
    @Query("SELECT SUM(p.tds) FROM PayrollRecord p WHERE p.month = :month AND p.year = :year")
    Optional<BigDecimal> sumTdsByMonthAndYear(int month, int year);
}
