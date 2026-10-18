package com.jobtracker.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "job_applications")
public class JobApplication {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 120)
    private String companyName;
    @Column(nullable = false, length = 120)
    private String role;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private JobStatus status = JobStatus.APPLIED;
    @Column(nullable = false)
    private LocalDate applicationDate = LocalDate.now();
    private LocalDate interviewDate;
    @Column(length = 2000)
    private String notes;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;

    protected JobApplication() {}
    public JobApplication(String companyName, String role, JobStatus status,
                          LocalDate applicationDate, LocalDate interviewDate,
                          String notes, User owner) {
        this.companyName = companyName; this.role = role;
        this.status = status == null ? JobStatus.APPLIED : status;
        this.applicationDate = applicationDate == null ? LocalDate.now() : applicationDate;
        this.interviewDate = interviewDate; this.notes = notes; this.owner = owner;
    }
    public Long getId() { return id; }
    public String getCompanyName() { return companyName; }
    public String getRole() { return role; }
    public JobStatus getStatus() { return status; }
    public LocalDate getApplicationDate() { return applicationDate; }
    public LocalDate getInterviewDate() { return interviewDate; }
    public String getNotes() { return notes; }
    public User getOwner() { return owner; }
    public void update(String companyName, String role, JobStatus status,
                       LocalDate applicationDate, LocalDate interviewDate, String notes) {
        this.companyName = companyName;
        this.role = role;
        this.status = status == null ? JobStatus.APPLIED : status;
        this.applicationDate = applicationDate == null ? LocalDate.now() : applicationDate;
        this.interviewDate = interviewDate;
        this.notes = notes;
    }
}
