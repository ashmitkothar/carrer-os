
package com.careeros.career_os.repository;

import com.careeros.career_os.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository
        extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findAllByUserIdOrderByAppliedDateDesc(Long userId);

    Optional<JobApplication> findByIdAndUserId(Long id, Long userId);

    void deleteByIdAndUserId(Long id, Long userId);
}
