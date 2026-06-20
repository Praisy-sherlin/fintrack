package com.fintrack.loan;
import java.math.BigDecimal;
import java.time.LocalDate;

public record LoanDto(Long id, Long employeeId, String employeeName, String type,
    BigDecimal amount, Integer tenureMonths, BigDecimal interestRate,
    BigDecimal emiAmount, BigDecimal remainingAmount, Integer paidInstallments,
    String purpose, String status, LocalDate disbursedDate) {}
