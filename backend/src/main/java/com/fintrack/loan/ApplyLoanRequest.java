package com.fintrack.loan;
import java.math.BigDecimal;
public record ApplyLoanRequest(String type, BigDecimal amount, Integer tenureMonths,
    BigDecimal interestRate, String purpose) {}
