package com.fintrack.expense;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "expenses")
@EntityListeners(AuditingEntityListener.class)
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Expense {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private Long employeeId;
    @Column(nullable = false) private String employeeName;
    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private ExpenseCategory category;
    @Column(nullable = false, length = 500) private String description;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal amount;
    private String receiptUrl;
    @Enumerated(EnumType.STRING) @Builder.Default
    private ExpenseStatus status = ExpenseStatus.PENDING;
    private String remarks;
    private Long approvedBy;
    private LocalDateTime approvedAt;
    private LocalDate submittedDate;
    @CreatedDate @Column(updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate private LocalDateTime updatedAt;
}
