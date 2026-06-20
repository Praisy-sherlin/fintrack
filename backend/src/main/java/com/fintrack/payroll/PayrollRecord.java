package com.fintrack.payroll;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll_records",
       uniqueConstraints = @UniqueConstraint(columnNames = {"employee_id", "month", "year"}))
@EntityListeners(AuditingEntityListener.class)
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PayrollRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "employee_id", nullable = false) private Long employeeId;
    @Column(nullable = false) private String employeeName;
    private String department;
    @Column(nullable = false) private Integer month;
    @Column(nullable = false) private Integer year;
    @Column(precision = 12, scale = 2) private BigDecimal basicSalary;
    @Column(precision = 12, scale = 2) private BigDecimal hra;
    @Column(precision = 12, scale = 2) private BigDecimal da;
    @Column(precision = 12, scale = 2) private BigDecimal grossSalary;
    @Column(precision = 12, scale = 2) private BigDecimal pf;
    @Column(precision = 12, scale = 2) private BigDecimal tds;
    @Column(precision = 12, scale = 2) private BigDecimal netSalary;
    @Enumerated(EnumType.STRING) @Builder.Default private PayrollStatus status = PayrollStatus.PENDING;
    private String remarks;
    private LocalDateTime processedDate;
    private LocalDateTime approvedDate;
    @CreatedDate @Column(updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate private LocalDateTime updatedAt;
}
