package org.example.tmdt.service;

public interface EmailService {

    void sendHtml(String to, String subject, String htmlBody);
}

