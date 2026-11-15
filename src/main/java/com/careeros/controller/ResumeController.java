
package com.careeros.career_os.controller;

import com.careeros.career_os.entity.Resume;
import com.careeros.career_os.repository.ResumeRepository;
import com.careeros.career_os.service.GeminiService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/resumes")
@CrossOrigin(origins = "http://localhost:5173")
public class ResumeController {

    private final ResumeRepository resumeRepository;
    private final GeminiService geminiService;

    public ResumeController(
            ResumeRepository resumeRepository,
            GeminiService geminiService) {

        this.resumeRepository = resumeRepository;
        this.geminiService = geminiService;
    }

    // Save or update resume
    @PostMapping("/{userId}")
    public ResponseEntity<?> saveResume(
            @PathVariable Long userId,
            @RequestBody Resume request) {

        if (request.getFullName() == null ||
                request.getFullName().isBlank()) {

            return ResponseEntity.badRequest()
                    .body("Full name is required.");
        }

        Resume resume = resumeRepository.findByUserId(userId)
                .orElse(new Resume());

        resume.setUserId(userId);
        resume.setFullName(request.getFullName());
        resume.setEmail(request.getEmail());
        resume.setPhone(request.getPhone());
        resume.setLocation(request.getLocation());
        resume.setLinkedIn(request.getLinkedIn());
        resume.setGithub(request.getGithub());
        resume.setProfessionalSummary(request.getProfessionalSummary());
        resume.setSkills(request.getSkills());
        resume.setEducation(request.getEducation());
        resume.setExperience(request.getExperience());
        resume.setProjects(request.getProjects());
        resume.setCertifications(request.getCertifications());

        Resume savedResume = resumeRepository.save(resume);

        return ResponseEntity.ok(savedResume);
    }

    // Get saved resume
    @GetMapping("/{userId}")
    public ResponseEntity<Resume> getResume(
            @PathVariable Long userId) {

        return resumeRepository.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // AI Resume Analysis
    @PostMapping("/{userId}/analyze")
    public ResponseEntity<?> analyzeResume(
            @PathVariable Long userId) {

        System.out.println("================================");
        System.out.println("RESUME ANALYSIS REQUEST RECEIVED");
        System.out.println("User ID: " + userId);

        Resume resume = resumeRepository.findByUserId(userId)
                .orElse(null);

        if (resume == null) {
            System.out.println("Resume not found!");

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "error",
                            "Please save your resume before analyzing."
                    ));
        }

        System.out.println("Resume found in database.");

        String resumeDetails = """
                Full Name: %s
                Professional Summary: %s
                Skills: %s
                Education: %s
                Experience: %s
                Projects: %s
                Certifications: %s
                """.formatted(
                resume.getFullName(),
                resume.getProfessionalSummary(),
                resume.getSkills(),
                resume.getEducation(),
                resume.getExperience(),
                resume.getProjects(),
                resume.getCertifications()
        );

        String prompt = """
                You are a professional resume reviewer.

                Analyze this student's resume carefully.

                Return your answer in clean Markdown with proper
                headings, paragraphs and bullet points.

                Include these sections:

                ## 1. Resume Overview
                Briefly describe the resume quality.

                ## 2. ATS Compatibility Score
                Give an indicative score out of 100.
                Explain that this is an estimate, not a real ATS test.

                ## 3. Resume Strengths
                List the strong points.

                ## 4. Missing Skills and Keywords
                Suggest relevant skills and keywords.
                Do not claim the student already knows missing skills.

                ## 5. Areas for Improvement
                Explain what needs improvement.

                ## 6. Professional Summary Suggestions
                Suggest an improved summary based only on
                the information actually provided.

                ## 7. Final Recommendations
                Give five practical suggestions.

                Be honest, specific and beginner-friendly.
                Never invent experience, qualifications or achievements.
                Never guarantee ATS selection or job placement.

                RESUME DETAILS:

                """ + resumeDetails;

        try {
            System.out.println("Sending resume to Gemini AI...");
            System.out.println("Waiting for Gemini response...");

            String analysis =
                    geminiService.generateResponse(prompt);

            System.out.println("Gemini response received successfully!");
            System.out.println("RESUME ANALYSIS COMPLETED");
            System.out.println("================================");

            return ResponseEntity.ok(
                    Map.of("analysis", analysis)
            );

        } catch (Exception e) {

            System.err.println("RESUME ANALYSIS FAILED!");
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of(
                            "error",
                            "Resume analysis failed: " + e.getMessage()
                    ));
        }
    }
}
