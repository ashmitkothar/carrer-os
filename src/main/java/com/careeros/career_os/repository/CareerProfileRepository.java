package com.careeros.career_os.repository;

import com.careeros.career_os.model.CareerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CareerProfileRepository
        extends JpaRepository<CareerProfile, Long> {

    Optional<CareerProfile> findByUser_Id(Long userId);
}
