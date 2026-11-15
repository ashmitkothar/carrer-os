
package com.careeros.career_os.controller;

import com.careeros.career_os.entity.JobApplication;
import com.careeros.career_os.repository.JobApplicationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:5173")
public class JobApplicationController {

    private final JobApplicationRepository repository;

    public JobApplicationController(JobApplicationRepository repository) {
        this.repository = repository;
    }

    // Get all applications of a user
    @GetMapping("/{userId}")
    public List<JobApplication> getApplications(@PathVariable Long userId) {
        return repository.findAllByUserIdOrderByAppliedDateDesc(userId);
    }

    // Add new application
    @PostMapping("/{userId}")
    public ResponseEntity<?> addApplication(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {

        String company = request.get("companyName");
        String role = request.get("jobRole");
        String status = request.get("status");

        if (userId <= 0 || company == null || company.isBlank()
                || role == null || role.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Please provide valid application details."));
        }

        if (!isValidStatus(status)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid application status."));
        }

        JobApplication application = new JobApplication();
        application.setUserId(userId);
        application.setCompanyName(company.trim());
        application.setJobRole(role.trim());
        application.setStatus(status);

        return ResponseEntity.ok(repository.save(application));
    }

    // Update application status
    @PutMapping("/{userId}/{applicationId}")
    public ResponseEntity<?> updateApplication(
            @PathVariable Long userId,
            @PathVariable Long applicationId,
            @RequestBody Map<String, String> request) {

        String status = request.get("status");

        if (!isValidStatus(status)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid application status."));
        }

        return repository.findByIdAndUserId(applicationId, userId)
                .map(application -> {
                    application.setStatus(status);
                    return ResponseEntity.ok(repository.save(application));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete application
    @DeleteMapping("/{userId}/{applicationId}")
    public ResponseEntity<?> deleteApplication(
            @PathVariable Long userId,
            @PathVariable Long applicationId) {

        return repository.findByIdAndUserId(applicationId, userId)
                .map(application -> {
                    repository.delete(application);
                    return ResponseEntity.ok(
                            Map.of("message", "Application deleted successfully.")
                    );
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private boolean isValidStatus(String status) {
        return status != null && List.of(
                "Applied", "Interview", "Selected", "Rejected"
        ).contains(status);
    }
}

