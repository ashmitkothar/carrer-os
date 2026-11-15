package com.careeros.career_os.dto;

public class CareerProfileRequest {

    private String highestEducation;
    private String college;
    private Integer graduationYear;
    private String skills;
    private String experience;
    private String careerInterest;

    public String getHighestEducation() { return highestEducation; }
    public void setHighestEducation(String value) { this.highestEducation = value; }

    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }

    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer year) { this.graduationYear = year; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public String getCareerInterest() { return careerInterest; }
    public void setCareerInterest(String interest) { this.careerInterest = interest; }
}
