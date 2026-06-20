package com.fintrack.expense;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ExpenseDto(Long id, Long employeeId, String employeeName, String category,
    String description, BigDecimal amount, String receiptUrl,
    String status, String remarks, LocalDate submittedDate, LocalDateTime approvedAt) {}
