package com.fintrack.expense;
import java.math.BigDecimal;
public record SubmitExpenseRequest(String category, String description, BigDecimal amount) {}
