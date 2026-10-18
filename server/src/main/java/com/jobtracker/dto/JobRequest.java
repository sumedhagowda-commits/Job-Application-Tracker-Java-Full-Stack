package com.jobtracker.dto;

import com.jobtracker.model.JobStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record JobRequest(
    @NotBlank @Size(max = 120) String companyName,
    @NotBlank @Size(max = 120) String role,
    JobStatus status,
    LocalDate applicationDate,
    LocalDate interviewDate,
    @Size(max = 2000) String notes
) {}
