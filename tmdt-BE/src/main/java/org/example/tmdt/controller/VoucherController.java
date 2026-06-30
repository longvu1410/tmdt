package org.example.tmdt.controller;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.example.tmdt.dto.VoucherRequest;
import org.example.tmdt.dto.VoucherResponse;
import org.example.tmdt.security.UserPrincipal;
import org.example.tmdt.service.VoucherService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/vouchers")
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherService voucherService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<VoucherResponse> getVouchers() {
        return voucherService.getVouchers();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public VoucherResponse createVoucher(@Valid @RequestBody VoucherRequest request) {
        return voucherService.createVoucher(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public VoucherResponse updateVoucher(@PathVariable Long id, @Valid @RequestBody VoucherRequest request) {
        return voucherService.updateVoucher(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public VoucherResponse deactivateVoucher(@PathVariable Long id) {
        return voucherService.deactivateVoucher(id);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('TEACHER')")
    public List<VoucherResponse> getTeacherVouchers(@AuthenticationPrincipal UserPrincipal principal) {
        return voucherService.getTeacherVouchers(principal);
    }

    @PostMapping("/teacher")
    @PreAuthorize("hasRole('TEACHER')")
    public VoucherResponse createTeacherVoucher(
            @Valid @RequestBody VoucherRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return voucherService.createTeacherVoucher(request, principal);
    }

    @PutMapping("/teacher/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public VoucherResponse updateTeacherVoucher(
            @PathVariable Long id,
            @Valid @RequestBody VoucherRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return voucherService.updateTeacherVoucher(id, request, principal);
    }

    @DeleteMapping("/teacher/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public VoucherResponse deactivateTeacherVoucher(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return voucherService.deactivateTeacherVoucher(id, principal);
    }
}
