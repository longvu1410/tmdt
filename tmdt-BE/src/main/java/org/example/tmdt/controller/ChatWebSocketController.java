package org.example.tmdt.controller;

import lombok.RequiredArgsConstructor;
import org.example.tmdt.entity.ChatMessage;
import org.example.tmdt.repository.ChatMessageRepository;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.time.Instant;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;

    @MessageMapping("/chat.send")
    public void sendMessage(ChatMessage message) {
        if (message.getTimestamp() == null) {
            message.setTimestamp(Instant.now());
        }
        message.setIsRead(false);
        
        // Save to database
        ChatMessage savedMessage = chatMessageRepository.save(message);

        // Broadcast to receiver's topic and sender's topic
        messagingTemplate.convertAndSend("/topic/chat/" + message.getReceiverId(), savedMessage);
        messagingTemplate.convertAndSend("/topic/chat/" + message.getSenderId(), savedMessage);
    }
}
