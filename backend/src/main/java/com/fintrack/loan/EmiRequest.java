package com.fintrack.loan;
import java.math.BigDecimal;
public record EmiRequest(BigDecimal amount, BigDecimal interestRate, Integer tenureMonths) {}
