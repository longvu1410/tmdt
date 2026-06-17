package org.example.tmdt.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@ConditionalOnProperty(name = "app.mail.provider", havingValue = "console")
public class ConsoleEmailService implements EmailService {

    @Override
    public void sendHtml(String to, String subject, String htmlBody) {
        log.info("DEV EMAIL (console) to={} subject={}\n{}", to, subject, htmlBody);
    }
}

