package com.fintrack.payroll;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PayrollDto(Long id, Long employeeId, String employeeName, String department,
    int month, int year, BigDecimal basicSalary, BigDecimal hra, BigDecimal da,
    BigDecimal grossSalary, BigDecimal pf, BigDecimal tds, BigDecimal netSalary,
    String status, String remarks, LocalDateTime processedDate) {}
