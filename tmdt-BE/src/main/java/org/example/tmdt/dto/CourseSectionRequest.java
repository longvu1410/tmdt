package org.example.tmdt.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CourseSectionRequest {

    @NotBlank
    @Size(max = 180)
    private String title;

    @NotBlank
    @Size(max = 700)
    private String description;

    @Size(max = 10)
    private List<@NotBlank @Size(max = 80) String> skills = new ArrayList<>();

    @NotNull
    @Min(1)
    private Integer lessonCount;

    @NotBlank
    @Size(max = 40)
    private String duration;
}
