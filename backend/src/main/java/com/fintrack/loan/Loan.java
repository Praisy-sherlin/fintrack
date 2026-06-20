package com.fintrack.loan;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "loans")
@EntityListeners(AuditingEntityListener.class)
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Loan {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private Long employeeId;
    @Column(nullable = false) private String employeeName;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private LoanType type;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal amount;
    @Column(nullable = false) private Integer tenureMonths;
    @Column(precision = 6, scale = 2) private BigDecimal interestRate;
    @Column(precision = 12, scale = 2) private BigDecimal emiAmount;
    @Column(precision = 12, scale = 2) private BigDecimal remainingAmount;
    @Column(nullable = false) private Integer paidInstallments;
    private String purpose;
    @Enumerated(EnumType.STRING) @Builder.Default private LoanStatus status = LoanStatus.PENDING;
    private String remarks;
    private Long approvedBy;
    private LocalDate disbursedDate;
    @CreatedDate @Column(updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate private LocalDateTime updatedAt;
}
