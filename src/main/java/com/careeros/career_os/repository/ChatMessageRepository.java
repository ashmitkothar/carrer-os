
package com.careeros.career_os.repository;

import com.careeros.career_os.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository
        extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findAllByUserIdOrderByCreatedAtAsc(Long userId);

    void deleteAllByUserId(Long userId);
}

