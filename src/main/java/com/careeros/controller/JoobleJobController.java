
package com.careeros.career_os.controller;

import com.careeros.career_os.service.JoobleService;

import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:5173")
public class JoobleJobController {

    private final JoobleService joobleService;

    public JoobleJobController(JoobleService joobleService) {
        this.joobleService = joobleService;
    }

    @GetMapping(
            value = "/live",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<String> searchLiveJobs(
            @RequestParam String keywords,
            @RequestParam(defaultValue = "India") String location,
            @RequestParam(defaultValue = "1") int page) {

        if (keywords.isBlank()) {
            return ResponseEntity.badRequest().body(
                    "{\"error\":\"Please enter job keywords.\"}"
            );
        }

        if (keywords.length() > 150 || location.length() > 100) {
            return ResponseEntity.badRequest().body(
                    "{\"error\":\"Search keywords or location are too long.\"}"
            );
        }

        if (page < 1) {
            return ResponseEntity.badRequest().body(
                    "{\"error\":\"Page must be at least 1.\"}"
            );
        }

        try {
            System.out.println("LIVE JOB SEARCH REQUEST RECEIVED");

            String result = joobleService.searchJobs(
                    keywords.trim(),
                    location.trim(),
                    page
            );

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(result);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest().body(
                    "{\"error\":\"Invalid job search request.\"}"
            );

        } catch (IllegalStateException e) {

            return ResponseEntity.status(
                    HttpStatus.SERVICE_UNAVAILABLE
            ).body("{\"error\":\"Jooble API key is missing.\"}");

        } catch (Exception e) {

            System.err.println("LIVE JOB SEARCH FAILED:");
            e.printStackTrace();

            return ResponseEntity.status(
                    HttpStatus.BAD_GATEWAY
            ).body("{\"error\":\"Unable to retrieve live jobs.\"}");
        }
    }
}
