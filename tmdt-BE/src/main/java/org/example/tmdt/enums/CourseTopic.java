package org.example.tmdt.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CourseTopic {
    IELTS("IELTS", "🎯"),
    TOEIC("TOEIC", "📊"),
    COMMUNICATION("Giao tiếp", "💬"),
    GRAMMAR("Ngữ pháp", "📖"),
    PRONUNCIATION("Phát âm", "🎙️"),
    WRITING("Viết", "✍️");

    private final String displayName;
    private final String icon;
}
