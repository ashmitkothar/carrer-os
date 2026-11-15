
package com.careeros.career_os.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CareerController {

    @GetMapping("/api/career/health")
    public String healthCheck() {
        return "Career OS is running successfully!";
    }
}
