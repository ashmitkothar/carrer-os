
package com.careeros.career_os.controller;

import com.careeros.career_os.service.GeminiService;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/resumes")
@CrossOrigin(origins = "http://localhost:5173")
public class ResumeUploadController {

    private final GeminiService geminiService;

    public ResumeUploadController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/{userId}/upload/analyze")
    public ResponseEntity<?> uploadAndAnalyze(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file) {

        System.out.println("Resume PDF upload request received!");
        System.out.println("User ID: " + userId);

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Please select a PDF file."));
        }

        String fileName = file.getOriginalFilename();

        if (fileName == null ||
                !fileName.toLowerCase().endsWith(".pdf")) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Only PDF files are allowed."));
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "PDF size must be below 5 MB."));
        }

        try {
            byte[] pdfBytes = file.getBytes();

            // Verify PDF file signature
            if (pdfBytes.length < 5 ||
                    pdfBytes[0] != '%' ||
                    pdfBytes[1] != 'P' ||
                    pdfBytes[2] != 'D' ||
                    pdfBytes[3] != 'F' ||
                    pdfBytes[4] != '-') {

                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid PDF file."));
            }

            String extractedText;
            int pageCount;

            // Extract text from PDF
            try (PDDocument document = Loader.loadPDF(pdfBytes)) {

                pageCount = document.getNumberOfPages();

                if (pageCount > 10) {
                    return ResponseEntity.badRequest()
                            .body(Map.of(
                                    "error",
                                    "Please upload a PDF with maximum 10 pages."
                            ));
                }

                PDFTextStripper stripper = new PDFTextStripper();
                stripper.setSortByPosition(true);

                extractedText = stripper.getText(document);
            }

            if (extractedText == null ||
                    extractedText.isBlank()) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "error",
                                "No readable text found. Please upload a text-based PDF."
                        ));
            }

            // Limit extracted text
            if (extractedText.length() > 30000) {
                extractedText = extractedText.substring(0, 30000);
            }

            String prompt = """
                    You are a professional AI resume analyzer.

                    Analyze the uploaded resume carefully.

                    Return your answer in clean Markdown.

                    Include these sections:

                    ## 1. Resume Overview

                    ## 2. Indicative ATS Compatibility Score
                    Give an estimated score out of 100.
                    Clearly mention that this is not a real ATS test.

                    ## 3. Resume Strengths

                    ## 4. Missing Skills and Keywords

                    ## 5. Areas for Improvement

                    ## 6. Professional Summary Suggestions

                    ## 7. Final Recommendations
                    Give five practical suggestions.

                    IMPORTANT:
                    - Never invent experience or qualifications.
                    - Do not claim missing skills are already known.
                    - Give honest and beginner-friendly feedback.
                    - Do not guarantee job selection.
                    - Use headings, bullet points and proper spacing.

                    UPLOADED RESUME TEXT:

                    """ + extractedText;

            System.out.println("PDF text extracted successfully.");
            System.out.println("Sending uploaded resume to Gemini...");

            String analysis = geminiService.generateResponse(prompt);

            System.out.println("Uploaded resume analysis completed!");

            return ResponseEntity.ok(
                    Map.of(
                            "analysis", analysis,
                            "fileName", fileName,
                            "pageCount", pageCount
                    )
            );

        } catch (IOException e) {

            System.err.println("PDF READING ERROR:");
            e.printStackTrace();

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "error",
                            "Could not read this PDF. Please upload a valid, unlocked PDF."
                    ));

        } catch (Exception e) {

            System.err.println("GEMINI ANALYSIS ERROR:");
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of(
                            "error",
                            "AI analysis failed. Please try again."
                    ));
        }
    }
}

