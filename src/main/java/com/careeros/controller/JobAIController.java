
package com.careeros.career_os.controller;

import com.careeros.career_os.service.GeminiService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:5173")
public class JobAIController {

    private final GeminiService geminiService;

    public JobAIController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/explain")
    public ResponseEntity<Map<String, String>> explainJob(
            @RequestBody Map<String, Object> request) {

        String role = read(request, "role");
        String company = read(request, "company");
        String location = read(request, "location");
        String category = read(request, "category");
        String salary = read(request, "salary");
        String candidateSkills = read(request, "candidateSkills");
        String careerInterest = read(request, "careerInterest");
        String education = read(request, "education");
        String matchedSkills = read(request, "matchedSkills");
        String missingSkills = read(request, "missingSkills");
        String matchScore = read(request, "matchScore");

        if (role.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Job role is required.")
            );
        }

        String prompt = """
                You are Career OS AI, a professional career advisor.

                Analyze this job opportunity for the candidate.

                JOB DETAILS:
                Role: %s
                Company: %s
                Location: %s
                Category: %s
                Salary: %s
                Required Skills: %s

                CANDIDATE PROFILE:
                Education: %s
                Career Interest: %s
                Current Skills: %s
                Matched Skills: %s
                Skills To Improve: %s
                Estimated Profile Match: %s

                Give a personalized analysis in Markdown.

                Include:

                ## 1. Job Overview
                Explain what this role involves.

                ## 2. Why This Job Matches
                Explain how the candidate's existing skills relate
                to this opportunity.

                ## 3. Strengths
                Identify the candidate's relevant skills.

                ## 4. Skills To Improve
                Explain the missing skills honestly.

                ## 5. Learning Roadmap
                Give three practical learning actions.

                ## 6. Interview Preparation
                Suggest five relevant interview topics.

                ## 7. Final Recommendation
                Explain whether this role is worth exploring.

                IMPORTANT:
                - Be beginner-friendly and realistic.
                - Do not invent candidate experience.
                - Do not guarantee selection.
                - The supplied match percentage is an estimate,
                  not an employer's hiring score.
                - Never claim this listing is a verified vacancy.
                """.formatted(
                role,
                company,
                location,
                category,
                salary,
                read(request, "requiredSkills"),
                education,
                careerInterest,
                candidateSkills,
                matchedSkills,
                missingSkills,
                matchScore
        );

        try {
            String explanation =
                    geminiService.generateResponse(prompt);

            return ResponseEntity.ok(
                    Map.of("explanation", explanation)
            );

        } catch (Exception e) {
            System.err.println("JOB AI ANALYSIS FAILED:");
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of(
                            "error",
                            "AI job analysis is temporarily unavailable."
                    ));
        }
    }

    private String read(Map<String, Object> request, String key) {
        Object value = request.get(key);

        if (value == null) {
            return "Not provided";
        }

        String result = String.valueOf(value);

        return result.length() > 1500
                ? result.substring(0, 1500)
                : result;
    }
}
