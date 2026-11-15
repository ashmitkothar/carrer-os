
package com.careeros.career_os.service;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.HttpOptions;

import org.springframework.stereotype.Service;

@Service
public class GeminiService {

    private final Client client;

    private static final String MODEL = "gemini-3.5-flash-lite";

    public GeminiService() {

        String apiKey = System.getenv("GOOGLE_API_KEY");

        if (apiKey == null || apiKey.isBlank()) {
            apiKey = System.getenv("GEMINI_API_KEY");
        }

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "Gemini API key is missing."
            );
        }

        HttpOptions httpOptions = HttpOptions.builder()
                .timeout(120000)
                .build();

        this.client = Client.builder()
                .apiKey(apiKey)
                .httpOptions(httpOptions)
                .build();

        System.out.println("Gemini Service initialized successfully!");
    }

    public String generateResponse(String prompt) {

        if (prompt == null || prompt.isBlank()) {
            throw new IllegalArgumentException(
                    "Prompt cannot be empty."
            );
        }

        try {

            System.out.println("Gemini API request started...");

            GenerateContentResponse response =
                    client.models.generateContent(
                            MODEL,
                            prompt,
                            null
                    );

            String result = response.text();

            if (result == null || result.isBlank()) {
                throw new RuntimeException(
                        "Gemini returned an empty response."
                );
            }

            System.out.println("Gemini API response received!");

            return result;

        } catch (Exception e) {

            System.err.println("Gemini API request failed!");
            System.err.println(
                    "Error: " + e.getClass().getSimpleName()
                            + " - " + e.getMessage()
            );

            throw new RuntimeException(
                    "Gemini API failed: " + e.getMessage(), e
            );
        }
    }
}
