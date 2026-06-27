package org.example.tmdt.dto;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CourseSectionResponse {

    private String title;
    private String description;
    private List<String> skills;
    private Integer lessonCount;
    private String duration;
    private String videoUrl;
}
