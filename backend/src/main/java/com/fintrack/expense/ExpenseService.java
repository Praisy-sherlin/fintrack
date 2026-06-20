package com.fintrack.expense;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class ExpenseService {
    private final ExpenseRepository repo;

    public Page<ExpenseDto> getAll(Long employeeId, String status, Pageable pageable) {
        if (employeeId != null && status != null)
            return repo.findByEmployeeIdAndStatus(employeeId, ExpenseStatus.valueOf(status), pageable).map(this::toDto);
        if (employeeId != null) return repo.findByEmployeeId(employeeId, pageable).map(this::toDto);
        if (status != null) return repo.findByStatus(ExpenseStatus.valueOf(status), pageable).map(this::toDto);
        return repo.findAll(pageable).map(this::toDto);
    }

    public ExpenseDto getById(Long id) { return toDto(findOrThrow(id)); }

    public ExpenseDto submit(Long employeeId, String employeeName, SubmitExpenseRequest req) {
        ExpenseCategory cat;
        try { cat = ExpenseCategory.valueOf(req.category().toUpperCase().replace(" ", "_")); }
        catch (IllegalArgumentException e) { cat = ExpenseCategory.OTHER; }
        Expense expense = Expense.builder()
            .employeeId(employeeId).employeeName(employeeName).category(cat)
            .description(req.description()).amount(req.amount())
            .status(ExpenseStatus.PENDING).submittedDate(LocalDate.now()).build();
        return toDto(repo.save(expense));
    }

    public ExpenseDto approve(Long id, Long approverId, String remarks) {
        Expense e = findOrThrow(id);
        e.setStatus(ExpenseStatus.APPROVED);
        e.setApprovedBy(approverId); e.setApprovedAt(LocalDateTime.now()); e.setRemarks(remarks);
        return toDto(repo.save(e));
    }

    public ExpenseDto reject(Long id, Long approverId, String remarks) {
        Expense e = findOrThrow(id);
        e.setStatus(ExpenseStatus.REJECTED);
        e.setApprovedBy(approverId); e.setApprovedAt(LocalDateTime.now()); e.setRemarks(remarks);
        return toDto(repo.save(e));
    }

    public record ExpenseSummary(BigDecimal totalPending, BigDecimal totalApproved, long pendingCount, long approvedCount) {}

    public ExpenseSummary getSummary() {
        return new ExpenseSummary(
            repo.sumAmountByStatus(ExpenseStatus.PENDING).orElse(BigDecimal.ZERO),
            repo.sumAmountByStatus(ExpenseStatus.APPROVED).orElse(BigDecimal.ZERO),
            repo.countByStatus(ExpenseStatus.PENDING),
            repo.countByStatus(ExpenseStatus.APPROVED));
    }

    private Expense findOrThrow(Long id) {
        return repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Expense not found: " + id));
    }

    public ExpenseDto toDto(Expense e) {
        return new ExpenseDto(e.getId(), e.getEmployeeId(), e.getEmployeeName(),
            e.getCategory().name(), e.getDescription(), e.getAmount(),
            e.getReceiptUrl(), e.getStatus().name(), e.getRemarks(),
            e.getSubmittedDate(), e.getApprovedAt());
    }
}
