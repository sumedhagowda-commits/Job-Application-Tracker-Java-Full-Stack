package com.jobtracker.dto;

import com.jobtracker.model.JobApplication;
import com.jobtracker.model.JobStatus;
import java.time.LocalDate;

public record JobResponse(Long id, String companyName, String role, JobStatus status,
                          LocalDate applicationDate, LocalDate interviewDate, String notes) {
    public static JobResponse from(JobApplication job) {
        return new JobResponse(job.getId(), job.getCompanyName(), job.getRole(),
            job.getStatus(), job.getApplicationDate(), job.getInterviewDate(), job.getNotes());
    }
}
