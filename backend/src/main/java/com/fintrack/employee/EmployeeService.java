package com.fintrack.employee;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeService {

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

        String empId = String.format("FT-%03d", repo.count() + 1);
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

    public EmployeeDto toDto(Employee e) {
        return new EmployeeDto(e.getId(), e.getEmployeeId(), e.getName(), e.getEmail(),
                e.getPhone(), e.getDepartment(), e.getDesignation(), e.getSalary(),
                e.getJoinDate(), e.getStatus().name());
    }
}
