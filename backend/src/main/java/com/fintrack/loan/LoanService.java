package com.fintrack.loan;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LoanService {
    private final LoanRepository repo;

    public Page<LoanDto> getAll(Pageable pageable) { return repo.findAll(pageable).map(this::toDto); }
    public LoanDto getById(Long id) { return toDto(findOrThrow(id)); }

    public LoanDto apply(Long employeeId, String employeeName, ApplyLoanRequest req) {
        LoanType type = LoanType.valueOf(req.type().toUpperCase());
        BigDecimal rate = req.interestRate() != null ? req.interestRate() : new BigDecimal("8.5");
        BigDecimal emi = calculateEMI(req.amount(), rate, req.tenureMonths());
        Loan loan = Loan.builder()
            .employeeId(employeeId).employeeName(employeeName).type(type)
            .amount(req.amount()).tenureMonths(req.tenureMonths()).interestRate(rate)
            .emiAmount(emi).remainingAmount(req.amount()).paidInstallments(0)
            .purpose(req.purpose()).status(LoanStatus.PENDING).build();
        return toDto(repo.save(loan));
    }

    public LoanDto approve(Long id, Long approverId, String remarks) {
        Loan loan = findOrThrow(id);
        loan.setStatus(LoanStatus.ACTIVE);
        loan.setApprovedBy(approverId); loan.setDisbursedDate(LocalDate.now()); loan.setRemarks(remarks);
        return toDto(repo.save(loan));
    }

    public LoanDto reject(Long id, Long approverId, String remarks) {
        Loan loan = findOrThrow(id);
        loan.setStatus(LoanStatus.REJECTED);
        loan.setApprovedBy(approverId); loan.setRemarks(remarks);
        return toDto(repo.save(loan));
    }

    public List<RepaymentScheduleItem> getRepaymentSchedule(Long id) {
        Loan loan = findOrThrow(id);
        List<RepaymentScheduleItem> schedule = new ArrayList<>();
        BigDecimal balance = loan.getAmount();
        BigDecimal monthlyRate = loan.getInterestRate().divide(new BigDecimal("1200"), 10, RoundingMode.HALF_UP);
        LocalDate dueDate = loan.getDisbursedDate() != null ? loan.getDisbursedDate().plusMonths(1) : LocalDate.now().plusMonths(1);
        for (int i = 1; i <= loan.getTenureMonths(); i++) {
            BigDecimal interest = balance.multiply(monthlyRate).setScale(2, RoundingMode.HALF_UP);
            BigDecimal principal = loan.getEmiAmount().subtract(interest);
            balance = balance.subtract(principal).max(BigDecimal.ZERO);
            schedule.add(new RepaymentScheduleItem(i, dueDate, loan.getEmiAmount(), principal, interest, balance));
            dueDate = dueDate.plusMonths(1);
        }
        return schedule;
    }

    public record EmiResult(BigDecimal emi, BigDecimal totalPayable, BigDecimal totalInterest) {}

    public EmiResult calculateEMIResult(EmiRequest req) {
        BigDecimal emi = calculateEMI(req.amount(), req.interestRate(), req.tenureMonths());
        BigDecimal totalPayable = emi.multiply(new BigDecimal(req.tenureMonths()));
        return new EmiResult(emi, totalPayable, totalPayable.subtract(req.amount()));
    }

    private BigDecimal calculateEMI(BigDecimal principal, BigDecimal annualRate, int months) {
        BigDecimal r = annualRate.divide(new BigDecimal("1200"), 10, RoundingMode.HALF_UP);
        BigDecimal onePlusR = BigDecimal.ONE.add(r);
        BigDecimal pow = onePlusR.pow(months, new MathContext(15));
        return principal.multiply(r).multiply(pow)
            .divide(pow.subtract(BigDecimal.ONE), 2, RoundingMode.HALF_UP);
    }

    private Loan findOrThrow(Long id) {
        return repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Loan not found: " + id));
    }

    public LoanDto toDto(Loan l) {
        return new LoanDto(l.getId(), l.getEmployeeId(), l.getEmployeeName(), l.getType().name(),
            l.getAmount(), l.getTenureMonths(), l.getInterestRate(), l.getEmiAmount(),
            l.getRemainingAmount(), l.getPaidInstallments(), l.getPurpose(),
            l.getStatus().name(), l.getDisbursedDate());
    }
}
