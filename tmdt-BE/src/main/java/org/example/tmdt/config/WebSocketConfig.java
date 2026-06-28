package org.example.tmdt.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.beans.factory.annotation.Value;
import java.util.List;
import java.util.ArrayList;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private List<String> allowedOrigins;

    @Value("${app.web.base-url:http://localhost:5173}")
    private String appWebBaseUrl;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        List<String> origins = new ArrayList<>(allowedOrigins);
        if (appWebBaseUrl != null && !origins.contains(appWebBaseUrl)) {
            origins.add(appWebBaseUrl);
        }
        registry.addEndpoint("/ws")
                .setAllowedOrigins(origins.toArray(new String[0]))
                .withSockJS();
    }
}
