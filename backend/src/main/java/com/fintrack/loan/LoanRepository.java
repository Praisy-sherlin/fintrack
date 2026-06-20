package com.fintrack.loan;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    Page<Loan> findByEmployeeId(Long employeeId, Pageable pageable);
    List<Loan> findByStatusAndDisbursedDateBefore(LoanStatus status, LocalDate date);
    long countByStatus(LoanStatus status);
}
