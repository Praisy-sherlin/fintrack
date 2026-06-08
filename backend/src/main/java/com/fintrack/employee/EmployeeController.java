package com.fintrack.employee;

import com.fintrack.audit.AuditService;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

// ── Entity ────────────────────────────────────────────────────────────────────
@Entity
@Table(name = "employees")
@EntityListeners(AuditingEntityListener.class)
@Data @Builder @NoArgsConstructor @AllArgsConstructor
class Employee {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String employeeId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;
    private String department;
    private String designation;

    @Column(precision = 12, scale = 2)
    private BigDecimal salary;

    private LocalDate joinDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EmployeeStatus status = EmployeeStatus.ACTIVE;

    private String pan;
    private String bankAccountNumber;
    private String ifsc;
    private String bankName;

    @CreatedDate @Column(updatable = false)
    private LocalDateTime createdAt;
    @LastModifiedDate
    private LocalDateTime updatedAt;
}

enum EmployeeStatus { ACTIVE, INACTIVE, ON_LEAVE }

// ── Repository ────────────────────────────────────────────────────────────────
@Repository
interface EmployeeRepository extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee> {
    Page<Employee> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email, Pageable pageable);
    Page<Employee> findByDepartment(String department, Pageable pageable);
    boolean existsByEmail(String email);
    long countByStatus(EmployeeStatus status);
    long countByDepartment(String department);
}

// ── DTOs ──────────────────────────────────────────────────────────────────────
record EmployeeDto(Long id, String employeeId, String name, String email, String phone,
                   String department, String designation, BigDecimal salary, LocalDate joinDate,
                   String status) {}

record CreateEmployeeRequest(String name, String email, String phone, String department,
                              String designation, BigDecimal salary, LocalDate joinDate,
                              String status, String pan, String ifsc) {}

// ── Service ───────────────────────────────────────────────────────────────────
@Service
@RequiredArgsConstructor
@Transactional
class EmployeeService {

    private final EmployeeRepository repo;

    public Page<EmployeeDto> getAll(String search, String department, Pageable pageable) {
        Page<Employee> employees;
        if (search != null && !search.isBlank()) {
            employees = repo.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(search, search, pageable);
        } else if (department != null && !department.isBlank()) {
            employees = repo.findByDepartment(department, pageable);
        } else {
            employees = repo.findAll(pageable);
        }
        return employees.map(this::toDto);
    }

    public EmployeeDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    public EmployeeDto create(CreateEmployeeRequest req) {
        if (repo.existsByEmail(req.email())) throw new IllegalArgumentException("Email already exists");

        String empId = generateEmployeeId();
        Employee emp = Employee.builder()
                .employeeId(empId)
                .name(req.name()).email(req.email()).phone(req.phone())
                .department(req.department()).designation(req.designation())
                .salary(req.salary()).joinDate(req.joinDate())
                .status(req.status() != null ? EmployeeStatus.valueOf(req.status()) : EmployeeStatus.ACTIVE)
                .pan(req.pan()).ifsc(req.ifsc())
                .build();

        return toDto(repo.save(emp));
    }

    public EmployeeDto update(Long id, CreateEmployeeRequest req) {
        Employee emp = findOrThrow(id);
        if (req.name() != null) emp.setName(req.name());
        if (req.phone() != null) emp.setPhone(req.phone());
        if (req.department() != null) emp.setDepartment(req.department());
        if (req.designation() != null) emp.setDesignation(req.designation());
        if (req.salary() != null) emp.setSalary(req.salary());
        if (req.status() != null) emp.setStatus(EmployeeStatus.valueOf(req.status()));
        return toDto(repo.save(emp));
    }

    public void delete(Long id) {
        Employee emp = findOrThrow(id);
        emp.setStatus(EmployeeStatus.INACTIVE);
        repo.save(emp);
    }

    private Employee findOrThrow(Long id) {
        return repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Employee not found: " + id));
    }

    private EmployeeDto toDto(Employee e) {
        return new EmployeeDto(e.getId(), e.getEmployeeId(), e.getName(), e.getEmail(),
                e.getPhone(), e.getDepartment(), e.getDesignation(), e.getSalary(),
                e.getJoinDate(), e.getStatus().name());
    }

    private String generateEmployeeId() {
        long count = repo.count() + 1;
        return String.format("FT-%03d", count);
    }
}

// ── Controller ────────────────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService service;

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(service.getAll(search, department,
                org.springframework.data.domain.PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<EmployeeDto> create(@RequestBody CreateEmployeeRequest req) {
        return ResponseEntity.status(201).body(service.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<EmployeeDto> update(@PathVariable Long id, @RequestBody CreateEmployeeRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/departments")
    public ResponseEntity<List<String>> departments() {
        return ResponseEntity.ok(List.of("Engineering", "Finance", "HR", "Sales", "Marketing", "Operations"));
    }
}
