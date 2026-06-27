package org.example.tmdt.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Embeddable;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseSection {

    @Column(nullable = false, length = 180)
    private String title;

    @Column(length = 700)
    private String description;

    @Builder.Default
    @Convert(converter = StringListConverter.class)
    @Column(length = 700)
    private List<String> skills = new ArrayList<>();

    @Column(nullable = false)
    private Integer lessonCount;

    @Column(nullable = false, length = 40)
    private String duration;

    @Column(length = 500)
    private String videoUrl;
}
