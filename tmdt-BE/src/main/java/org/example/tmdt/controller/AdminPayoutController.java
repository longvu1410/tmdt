package org.example.tmdt.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.example.tmdt.dto.ProcessWithdrawalRequest;
import org.example.tmdt.dto.TeacherQuarterRevenueResponse;
import org.example.tmdt.dto.WithdrawalResponse;
import org.example.tmdt.security.UserPrincipal;
import org.example.tmdt.service.TeacherPayoutService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin Payouts", description = "API cho admin quan ly yeu cau rut tien cua teacher")
@RestController
@RequestMapping("/api/admin/payouts")
@RequiredArgsConstructor
public class AdminPayoutController {

    private final TeacherPayoutService teacherPayoutService;

    @Operation(
            summary = "Admin xem doanh thu quy cua mot teacher",
            description = "Tra ve tong doanh thu, so don PAID, tien dang cho rut, tien da rut, so tien con co the tao yeu cau rut va platformBalance la so tien con nam tren nen tang cua teacher trong quy."
    )
    @GetMapping("/teachers/{teacherId}/quarter-revenue")
    @PreAuthorize("hasRole('ADMIN')")
    public TeacherQuarterRevenueResponse getTeacherQuarterRevenue(
            @Parameter(description = "ID cua teacher can xem doanh thu") @PathVariable Long teacherId,
            @Parameter(description = "Nam can thong ke, vi du 2026") @RequestParam Integer year,
            @Parameter(description = "Quy can thong ke, gia tri tu 1 den 4") @RequestParam Integer quarter) {
        return teacherPayoutService.getTeacherQuarterRevenue(teacherId, year, quarter);
    }

    @Operation(
            summary = "Admin xem tat ca yeu cau rut tien",
            description = "Tra ve danh sach yeu cau rut tien cua tat ca teacher, sap xep moi nhat truoc."
    )
    @GetMapping("/withdrawals")
    @PreAuthorize("hasRole('ADMIN')")
    public List<WithdrawalResponse> getWithdrawals() {
        return teacherPayoutService.getWithdrawals();
    }

    @Operation(
            summary = "Admin duyet yeu cau rut tien",
            description = "Chuyen yeu cau rut tien tu PENDING sang APPROVED va ghi lai admin xu ly cung ghi chu neu co. Sau khi duyet, platformBalance cua teacher trong quy do se giam theo so tien da duyet."
    )
    @PostMapping("/withdrawals/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public WithdrawalResponse approveWithdrawal(
            @Parameter(description = "ID cua yeu cau rut tien") @PathVariable Long id,
            @Valid @RequestBody(required = false) ProcessWithdrawalRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return teacherPayoutService.approveWithdrawal(id, request, principal);
    }

    @Operation(
            summary = "Admin tu choi yeu cau rut tien",
            description = "Chuyen yeu cau rut tien tu PENDING sang REJECTED va ghi ly do tu choi trong adminNote neu co."
    )
    @PostMapping("/withdrawals/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public WithdrawalResponse rejectWithdrawal(
            @Parameter(description = "ID cua yeu cau rut tien") @PathVariable Long id,
            @Valid @RequestBody(required = false) ProcessWithdrawalRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return teacherPayoutService.rejectWithdrawal(id, request, principal);
    }
}
