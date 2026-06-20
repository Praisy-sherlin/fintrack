package com.fintrack.expense;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    Page<Expense> findByEmployeeId(Long employeeId, Pageable pageable);
    Page<Expense> findByStatus(ExpenseStatus status, Pageable pageable);
    Page<Expense> findByEmployeeIdAndStatus(Long employeeId, ExpenseStatus status, Pageable pageable);
    long countByStatus(ExpenseStatus status);
    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.status = :status")
    Optional<BigDecimal> sumAmountByStatus(ExpenseStatus status);
}
