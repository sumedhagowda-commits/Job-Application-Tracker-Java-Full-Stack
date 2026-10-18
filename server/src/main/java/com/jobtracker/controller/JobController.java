package com.jobtracker.controller;

import com.jobtracker.dto.JobRequest;
import com.jobtracker.dto.JobResponse;
import com.jobtracker.service.JobService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
public class JobController {
    private final JobService service;
    public JobController(JobService service) { this.service = service; }

    private Long userId(Authentication authentication) {
        return (Long) authentication.getPrincipal();
    }

    @GetMapping
    public List<JobResponse> list(Authentication auth,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String search) {
        return service.list(userId(auth), status, search);
    }

    @GetMapping("/summary")
    public Map<String, Long> summary(Authentication auth) {
        return service.summary(userId(auth));
    }

    @GetMapping("/{id}")
    public JobResponse get(Authentication auth, @PathVariable Long id) {
        return service.get(userId(auth), id);
    }

    @PostMapping
    public JobResponse create(Authentication auth, @Valid @RequestBody JobRequest request) {
        return service.create(userId(auth), request);
    }

    @PutMapping("/{id}")
    public JobResponse update(Authentication auth, @PathVariable Long id, @Valid @RequestBody JobRequest request) {
        return service.update(userId(auth), id, request);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> delete(Authentication auth, @PathVariable Long id) {
        service.delete(userId(auth), id);
        return Map.of("message", "Application deleted.");
    }
}
