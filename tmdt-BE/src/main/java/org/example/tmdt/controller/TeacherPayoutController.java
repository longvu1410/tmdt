package org.example.tmdt.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.example.tmdt.dto.CreateWithdrawalRequest;
import org.example.tmdt.dto.DailyRevenueDTO;
import org.example.tmdt.dto.TeacherQuarterRevenueResponse;
import org.example.tmdt.dto.WithdrawalResponse;
import org.example.tmdt.security.UserPrincipal;
import org.example.tmdt.service.TeacherPayoutService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Teacher Payouts", description = "API cho giang vien xem doanh thu va tao yeu cau rut tien")
@RestController
@RequestMapping("/api/teacher/payouts")
@RequiredArgsConstructor
public class TeacherPayoutController {

    private final TeacherPayoutService teacherPayoutService;

    @Operation(
            summary = "Thong ke doanh thu cua teacher trong mot quy",
            description = "Tra ve tong tien cac don hang PAID cua khoa hoc do teacher dang, so don da ban, tien dang cho rut, tien da rut, so tien con co the tao yeu cau rut va platformBalance la so tien con nam tren nen tang. Khi admin duyet yeu cau rut, platformBalance se giam theo so tien da duyet."
    )
    @GetMapping("/quarter-revenue")
    @PreAuthorize("hasAuthority('ROLE_TEACHER')")
    public TeacherQuarterRevenueResponse getMyQuarterRevenue(
            @Parameter(description = "Nam can thong ke, vi du 2026") @RequestParam Integer year,
            @Parameter(description = "Quy can thong ke, gia tri tu 1 den 4") @RequestParam Integer quarter,
            @AuthenticationPrincipal UserPrincipal principal) {
        return teacherPayoutService.getMyQuarterRevenue(year, quarter, principal);
    }

    @Operation(
            summary = "Doanh thu theo tung ngay trong quy",
            description = "Tra ve danh sach doanh thu theo tung ngay trong quy, bao gom ca cac ngay khong co don hang (revenue = 0)."
    )
    @GetMapping("/daily-revenue")
    @PreAuthorize("hasAuthority('ROLE_TEACHER')")
    public List<DailyRevenueDTO> getDailyRevenue(
            @Parameter(description = "Nam can thong ke, vi du 2026") @RequestParam Integer year,
            @Parameter(description = "Quy can thong ke, gia tri tu 1 den 4") @RequestParam Integer quarter,
            @AuthenticationPrincipal UserPrincipal principal) {
        return teacherPayoutService.getDailyRevenue(year, quarter, principal);
    }

    @Operation(
            summary = "Teacher tao yeu cau rut tien",
            description = "Teacher gui yeu cau rut tien cho admin. So tien rut khong duoc vuot qua doanh thu quy tru cac yeu cau dang cho hoac da duyet."
    )
    @PostMapping("/withdrawals")
    @PreAuthorize("hasAuthority('ROLE_TEACHER')")
    public WithdrawalResponse createWithdrawal(
            @Valid @RequestBody CreateWithdrawalRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return teacherPayoutService.createWithdrawal(request, principal);
    }

    @Operation(
            summary = "Teacher xem danh sach yeu cau rut tien cua minh",
            description = "Tra ve cac yeu cau rut tien cua teacher dang dang nhap, gom trang thai PENDING, APPROVED hoac REJECTED."
    )
    @GetMapping("/withdrawals")
    @PreAuthorize("hasAuthority('ROLE_TEACHER')")
    public List<WithdrawalResponse> getMyWithdrawals(@AuthenticationPrincipal UserPrincipal principal) {
        return teacherPayoutService.getMyWithdrawals(principal);
    }
}
