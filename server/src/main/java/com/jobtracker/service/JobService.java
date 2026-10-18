package com.jobtracker.service;

import com.jobtracker.dto.JobRequest;
import com.jobtracker.dto.JobResponse;
import com.jobtracker.model.*;
import com.jobtracker.repo.JobApplicationRepository;
import com.jobtracker.repo.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Locale;

@Service
public class JobService {
    private final JobApplicationRepository jobs;
    private final UserRepository users;
    public JobService(JobApplicationRepository jobs, UserRepository users) {
        this.jobs = jobs; this.users = users;
    }

    public List<JobResponse> list(Long userId, String status, String search) {
        String term = search == null ? "" : search.trim().toLowerCase(Locale.ROOT);
        JobStatus filter = null;
        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
            try { filter = JobStatus.valueOf(status.toUpperCase(Locale.ROOT)); }
            catch (IllegalArgumentException ex) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status."); }
        }
        JobStatus finalFilter = filter;
        return jobs.findByOwnerIdOrderByApplicationDateDesc(userId).stream()
            .filter(j -> finalFilter == null || j.getStatus() == finalFilter)
            .filter(j -> term.isEmpty() || j.getCompanyName().toLowerCase(Locale.ROOT).contains(term)
                || j.getRole().toLowerCase(Locale.ROOT).contains(term))
            .map(JobResponse::from).toList();
    }

    public JobResponse get(Long userId, Long id) { return JobResponse.from(owned(userId, id)); }

    public JobResponse create(Long userId, JobRequest request) {
        User owner = users.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User no longer exists."));
        JobApplication job = new JobApplication(request.companyName().trim(), request.role().trim(),
            request.status(), request.applicationDate(), request.interviewDate(), request.notes(), owner);
        return JobResponse.from(jobs.save(job));
    }

    public JobResponse update(Long userId, Long id, JobRequest request) {
        JobApplication job = owned(userId, id);
        job.update(request.companyName().trim(), request.role().trim(), request.status(),
            request.applicationDate(), request.interviewDate(), request.notes());
        return JobResponse.from(jobs.save(job));
    }

    public void delete(Long userId, Long id) { jobs.delete(owned(userId, id)); }

    public java.util.Map<String, Long> summary(Long userId) {
        return java.util.Map.of(
            "total", jobs.countByOwnerId(userId),
            "applied", jobs.countByOwnerIdAndStatus(userId, JobStatus.APPLIED),
            "interview", jobs.countByOwnerIdAndStatus(userId, JobStatus.INTERVIEW),
            "offer", jobs.countByOwnerIdAndStatus(userId, JobStatus.OFFER),
            "rejected", jobs.countByOwnerIdAndStatus(userId, JobStatus.REJECTED)
        );
    }

    private JobApplication owned(Long userId, Long id) {
        return jobs.findByIdAndOwnerId(id, userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found."));
    }
}
