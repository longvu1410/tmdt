package org.example.tmdt.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CourseTopicResponse {

    private String code;
    private String name;
    private String icon;
    private Long courseCount;
}
