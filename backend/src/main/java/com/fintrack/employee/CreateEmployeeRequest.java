package com.fintrack.employee;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateEmployeeRequest(
    String name,
    String email,
    String phone,
    String department,
    String designation,
    BigDecimal salary,
    LocalDate joinDate,
    String status,
    String pan,
    String ifsc
) {}
