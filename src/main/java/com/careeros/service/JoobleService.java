
package com.careeros.career_os.service;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.HashMap;
import java.util.Map;

@Service
public class JoobleService {

    private final RestClient restClient;
    private final String apiKey;

    public JoobleService() {
        this.restClient = RestClient.create();
        this.apiKey = System.getenv("JOOBLE_API_KEY");
    }

    public String searchJobs(
            String keywords,
            String location,
            int page) {

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "JOOBLE_API_KEY is not configured."
            );
        }

        if (keywords == null || keywords.isBlank()) {
            throw new IllegalArgumentException(
                    "Job keywords are required."
            );
        }

        if (location == null || location.isBlank()) {
            throw new IllegalArgumentException(
                    "Job location is required."
            );
        }

        Map<String, Object> request = new HashMap<>();

        request.put("keywords", keywords);
        request.put("location", location);
        request.put("page", Math.max(page, 1));
        request.put("ResultOnPage", 20);
        request.put("companysearch", false);

        try {
            System.out.println("Searching live jobs on Jooble...");

            String response = restClient.post()
                    .uri("https://in.jooble.org/api/{key}", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(String.class);

            if (response == null || response.isBlank()) {
                throw new RuntimeException(
                        "Jooble returned an empty response."
                );
            }

            System.out.println("Jooble response received!");

            return response;

        } catch (RestClientResponseException e) {

            System.err.println(
                    "Jooble HTTP ERROR: " + e.getStatusCode().value()
            );

            throw new RuntimeException(
                    "Jooble API returned HTTP "
                            + e.getStatusCode().value()
            );

        } catch (ResourceAccessException e) {

            System.err.println("Jooble connection failed.");

            throw new RuntimeException(
                    "Unable to connect to Jooble."
            );
        }
    }
}
