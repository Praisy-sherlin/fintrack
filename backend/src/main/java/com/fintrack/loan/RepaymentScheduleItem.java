package com.fintrack.loan;
import java.math.BigDecimal;
import java.time.LocalDate;
public record RepaymentScheduleItem(int installmentNo, LocalDate dueDate,
    BigDecimal emi, BigDecimal principal, BigDecimal interest, BigDecimal balance) {}
