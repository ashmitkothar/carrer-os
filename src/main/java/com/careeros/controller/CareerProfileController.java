
package com.careeros.career_os.controller;

import com.careeros.career_os.dto.CareerProfileRequest;
import com.careeros.career_os.model.CareerProfile;
import com.careeros.career_os.model.User;
import com.careeros.career_os.repository.CareerProfileRepository;
import com.careeros.career_os.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:5173")
public class CareerProfileController {

    private final CareerProfileRepository profileRepository;
    private final UserRepository userRepository;

    public CareerProfileController(
            CareerProfileRepository profileRepository,
            UserRepository userRepository) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/{userId}")
    public ResponseEntity<?> saveProfile(
            @PathVariable Long userId,
            @RequestBody CareerProfileRequest request) {

        Optional<User> optionalUser = userRepository.findById(userId);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        if (request.getHighestEducation() == null ||
                request.getCollege() == null ||
                request.getGraduationYear() == null ||
                request.getSkills() == null ||
                request.getExperience() == null ||
                request.getCareerInterest() == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Please fill all profile fields"));
        }

        CareerProfile profile = profileRepository
                .findByUser_Id(userId)
                .orElse(new CareerProfile());

        profile.setUser(optionalUser.get());
        profile.setHighestEducation(request.getHighestEducation());
        profile.setCollege(request.getCollege());
        profile.setGraduationYear(request.getGraduationYear());
        profile.setSkills(request.getSkills());
        profile.setExperience(request.getExperience());
        profile.setCareerInterest(request.getCareerInterest());

        CareerProfile saved = profileRepository.save(profile);

        return ResponseEntity.ok(Map.of(
                "message", "Career profile saved successfully!",
                "profileId", saved.getId(),
                "userId", userId
        ));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getProfile(@PathVariable Long userId) {

        Optional<CareerProfile> optionalProfile =
                profileRepository.findByUser_Id(userId);

        if (optionalProfile.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Career profile not found"));
        }

        CareerProfile profile = optionalProfile.get();

        return ResponseEntity.ok(Map.of(
                "highestEducation", profile.getHighestEducation(),
                "college", profile.getCollege(),
                "graduationYear", profile.getGraduationYear(),
                "skills", profile.getSkills(),
                "experience", profile.getExperience(),
                "careerInterest", profile.getCareerInterest()
        ));
    }
}
