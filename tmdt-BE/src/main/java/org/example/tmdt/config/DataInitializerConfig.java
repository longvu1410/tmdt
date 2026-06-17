package org.example.tmdt.config;

import java.math.BigDecimal;
import java.util.List;
import org.example.tmdt.entity.Course;
import org.example.tmdt.entity.CourseLevel;
import org.example.tmdt.entity.CourseReview;
import org.example.tmdt.entity.CourseSection;
import org.example.tmdt.entity.CourseStatus;
import org.example.tmdt.entity.CourseTopic;
import org.example.tmdt.entity.Role;
import org.example.tmdt.entity.RoleName;
import org.example.tmdt.repository.CourseRepository;
import org.example.tmdt.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializerConfig {

    @Bean
    public CommandLineRunner roleSeeder(RoleRepository roleRepository) {
        return args -> {
            if (roleRepository.findByName(RoleName.ROLE_STUDENT).isEmpty()) {
                roleRepository.save(Role.builder().name(RoleName.ROLE_STUDENT).build());
            }
            if (roleRepository.findByName(RoleName.ROLE_ADMIN).isEmpty()) {
                roleRepository.save(Role.builder().name(RoleName.ROLE_ADMIN).build());
            }
            if (roleRepository.findByName(RoleName.ROLE_TEACHER).isEmpty()) {
                roleRepository.save(Role.builder().name(RoleName.ROLE_TEACHER).build());
            }
        };
    }

    @Bean
    public CommandLineRunner courseSeeder(CourseRepository courseRepository) {
        return args -> {
            var existingCourse = courseRepository.findBySlug("ielts-7-cap-toc-khoa-1");
            if (existingCourse.isPresent()) {
                Course course = existingCourse.get();
                boolean changed = false;
                if (course.getStatus() == null) {
                    course.setStatus(CourseStatus.APPROVED);
                    course.setActive(true);
                    changed = true;
                }
                if (course.getTopic() == null) {
                    course.setTopic(CourseTopic.IELTS);
                    changed = true;
                }
                if (changed) {
                    courseRepository.save(course);
                }
                return;
            }

            courseRepository.save(Course.builder()
                    .slug("ielts-7-cap-toc-khoa-1")
                    .title("IELTS 7.0 Cap Toc (Khoa 1)")
                    .description("Khoa hoc duoc thiet ke dac biet giup ban dat muc tieu IELTS 7.0 trong thoi gian ngan nhat voi lo trinh ca nhan hoa.")
                    .price(new BigDecimal("1500000.00"))
                    .thumbnailUrl("https://images.unsplash.com/photo-1434030216411-0b793f4b4173")
                    .instructorName("Thay John Doe")
                    .language("Trung cap")
                    .level(CourseLevel.INTERMEDIATE)
                    .topic(CourseTopic.IELTS)
                    .studentCount(3420)
                    .lessonCount(48)
                    .totalDuration("36h 35m")
                    .rating(new BigDecimal("4.90"))
                    .ratingCount(1245)
                    .outcomes(List.of(
                            "Nam vung cau truc de thi IELTS",
                            "Chien luoc Reading hieu qua",
                            "Speaking tu tin voi giam khao",
                            "Ky nang Listening band 7+",
                            "Writing Task 1 & 2 mau",
                            "Tu vung chu de thuong gap"
                    ))
                    .benefits(List.of(
                            "Truy cap tron doi",
                            "Chung chi hoan thanh",
                            "Ho tro 1-1 voi giang vien"
                    ))
                    .sections(List.of(
                            CourseSection.builder()
                                    .title("Gioi thieu & Cau truc de thi")
                                    .description("Nam tong quan bai thi IELTS, cach tinh diem va lo trinh hoc phu hop muc tieu 7.0. Vi du: phan biet band 6.0 va 7.0 qua mot bai Writing mau.")
                                    .skills(List.of("Test format", "Study planning"))
                                    .lessonCount(5)
                                    .duration("3h 20m")
                                    .build(),
                            CourseSection.builder()
                                    .title("Listening Skills")
                                    .description("Luyen nghe theo tung part, nhan dien keyword, distractor va cach ghi dap an chinh xac. Vi du: nghe mot doan Part 2 va gach chan tu khoa truoc khi chon dap an.")
                                    .skills(List.of("Listening", "Note-taking", "Keyword tracking"))
                                    .lessonCount(8)
                                    .duration("5h 45m")
                                    .build(),
                            CourseSection.builder()
                                    .title("Reading Strategies")
                                    .description("Thuc hanh skimming, scanning, matching headings va xu ly True/False/Not Given. Vi du: doc nhanh mot passage ve education va tim vi tri cau tra loi trong 60 giay.")
                                    .skills(List.of("Reading", "Skimming", "Scanning"))
                                    .lessonCount(10)
                                    .duration("7h 10m")
                                    .build(),
                            CourseSection.builder()
                                    .title("Writing Task 1 & 2")
                                    .description("Hoc cach phan tich de, lap dan y, viet cau truc bai va nang cap tu vung hoc thuat. Vi du: lap outline cho de agree/disagree ve online learning.")
                                    .skills(List.of("Writing Task 1", "Writing Task 2", "Academic vocabulary"))
                                    .lessonCount(12)
                                    .duration("9h 30m")
                                    .build(),
                            CourseSection.builder()
                                    .title("Speaking Practice")
                                    .description("Luyen tra loi Part 1-3, mo rong y tuong va cai thien phat am, do troi chay. Vi du: tra loi chu de hometown bang mo hinh point-reason-example.")
                                    .skills(List.of("Speaking", "Pronunciation", "Fluency"))
                                    .lessonCount(8)
                                    .duration("6h 15m")
                                    .build()
                    ))
                    .reviews(List.of(
                            CourseReview.builder()
                                    .studentName("Nguyen Van A")
                                    .rating(5)
                                    .comment("Khoa hoc rat chi tiet, thay giao ho tro nhiet tinh! Minh da dat 7.0 IELTS sau 3 thang.")
                                    .build()
                    ))
                    .status(CourseStatus.APPROVED)
                    .active(true)
                    .build());
        };
    }
}
