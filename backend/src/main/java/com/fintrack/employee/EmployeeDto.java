package com.fintrack.employee;

import java.math.BigDecimal;
import java.time.LocalDate;

public record EmployeeDto(
    Long id,
    String employeeId,
    String name,
    String email,
    String phone,
    String department,
    String designation,
    BigDecimal salary,
    LocalDate joinDate,
    String status
) {}
