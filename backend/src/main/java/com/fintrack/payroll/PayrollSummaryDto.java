package com.fintrack.payroll;
import java.math.BigDecimal;
public record PayrollSummaryDto(BigDecimal totalGross, BigDecimal totalNet,
    BigDecimal totalTds, long pendingCount, long totalCount) {}
