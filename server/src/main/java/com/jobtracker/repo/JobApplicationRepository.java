package com.jobtracker.repo;

import com.jobtracker.model.JobApplication;
import com.jobtracker.model.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByOwnerIdOrderByApplicationDateDesc(Long ownerId);
    Optional<JobApplication> findByIdAndOwnerId(Long id, Long ownerId);
    long countByOwnerId(Long ownerId);
    long countByOwnerIdAndStatus(Long ownerId, JobStatus status);
}
