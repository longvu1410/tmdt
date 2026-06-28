package org.example.tmdt.controller;

import lombok.RequiredArgsConstructor;
import org.example.tmdt.dto.ChatContactDTO;
import org.example.tmdt.entity.ChatMessage;
import org.example.tmdt.repository.ChatMessageRepository;
import org.example.tmdt.repository.CourseEnrollmentRepository;
import org.example.tmdt.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatMessageRepository chatMessageRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;

    @GetMapping("/contacts")
    public List<ChatContactDTO> getContacts(@AuthenticationPrincipal UserPrincipal principal) {
        Long currentUserId = principal.getId();
        boolean isTeacher = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TEACHER"));

        List<ChatContactDTO> contacts;
        if (isTeacher) {
            contacts = courseEnrollmentRepository.findStudentsByTeacherId(currentUserId);
        } else {
            contacts = courseEnrollmentRepository.findTeachersByStudentId(currentUserId);
        }

        // Populate unread counts
        for (ChatContactDTO contact : contacts) {
            long unread = chatMessageRepository.countBySenderIdAndReceiverIdAndCourseIdAndIsReadFalse(
                    contact.getId(), currentUserId, contact.getCourseId()
            );
            contact.setUnreadCount(unread);
        }

        return contacts;
    }

    @GetMapping("/history")
    public List<ChatMessage> getHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("contactId") Long contactId,
            @RequestParam("courseId") Long courseId) {
        Long currentUserId = principal.getId();

        // Mark received messages from this contact as read
        chatMessageRepository.markAsRead(contactId, currentUserId, courseId);

        // Fetch history
        return chatMessageRepository.findChatHistory(courseId, currentUserId, contactId);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(@AuthenticationPrincipal UserPrincipal principal) {
        Long currentUserId = principal.getId();
        long unread = chatMessageRepository.countByReceiverIdAndIsReadFalse(currentUserId);
        return Map.of("unreadCount", unread);
    }
}
