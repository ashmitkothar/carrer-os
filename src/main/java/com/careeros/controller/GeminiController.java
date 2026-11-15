
package com.careeros.career_os.controller;

import com.careeros.career_os.entity.ChatMessage;
import com.careeros.career_os.repository.ChatMessageRepository;
import com.careeros.career_os.service.GeminiService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class GeminiController {

    private final GeminiService geminiService;
    private final ChatMessageRepository chatMessageRepository;

    public GeminiController(
            GeminiService geminiService,
            ChatMessageRepository chatMessageRepository) {

        this.geminiService = geminiService;
        this.chatMessageRepository = chatMessageRepository;
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(
            @RequestBody Map<String, Object> request) {

        String message = request.get("message") instanceof String
                ? (String) request.get("message")
                : "";

        Object userIdValue = request.get("userId");

        if (!(userIdValue instanceof Number)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid user ID."));
        }

        Long userId = ((Number) userIdValue).longValue();

        if (message.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Please enter a message."));
        }

        if (message.length() > 4000) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Message is too long."));
        }

        String prompt = String.join("\n",
                "You are Career OS AI, a friendly professional career assistant.",
                "Help users with career guidance, Java, Spring Boot, resumes,",
                "interviews, job preparation and learning roadmaps.",
                "Always use clean Markdown formatting.",
                "Use headings, paragraphs, bullet points and bold text.",
                "Be beginner-friendly and practical.",
                "Do not invent job openings or guarantee placements.",
                "",
                "User's question:"
        ) + "\n" + message;

        try {
            System.out.println("Sending request to Gemini...");

            String reply = geminiService.generateResponse(prompt);

            // Save user message
            ChatMessage userMessage = new ChatMessage();
            userMessage.setUserId(userId);
            userMessage.setRole("user");
            userMessage.setContent(message);

            // Save AI response
            ChatMessage assistantMessage = new ChatMessage();
            assistantMessage.setUserId(userId);
            assistantMessage.setRole("assistant");
            assistantMessage.setContent(reply);

            chatMessageRepository.saveAll(
                    List.of(userMessage, assistantMessage)
            );

            System.out.println("Chat messages saved to MySQL!");

            return ResponseEntity.ok(
                    Map.of("reply", reply)
            );

        } catch (Exception e) {
            System.err.println("GEMINI CHAT ERROR:");
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of(
                            "error",
                            "AI Assistant is temporarily unavailable."
                    ));
        }
    }
}
