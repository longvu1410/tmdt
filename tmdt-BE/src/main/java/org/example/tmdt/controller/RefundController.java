package org.example.tmdt.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.tmdt.dto.CreateRefundRequest;
import org.example.tmdt.dto.HandleRefundRequest;
import org.example.tmdt.dto.RefundRequestResponse;
import org.example.tmdt.security.UserPrincipal;
import org.example.tmdt.service.RefundService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/refunds")
@RequiredArgsConstructor
public class RefundController {

    private final RefundService refundService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public RefundRequestResponse requestRefund(
            @Valid @RequestBody CreateRefundRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return refundService.requestRefund(request, principal);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public List<RefundRequestResponse> getMyRefundRequests(@AuthenticationPrincipal UserPrincipal principal) {
        return refundService.getMyRefundRequests(principal);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<RefundRequestResponse> getAllRefundRequests() {
        return refundService.getAllRefundRequests();
    }

    @PutMapping("/{id}/handle")
    @PreAuthorize("hasRole('ADMIN')")
    public RefundRequestResponse handleRefundRequest(
            @PathVariable Long id,
            @Valid @RequestBody HandleRefundRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return refundService.handleRefundRequest(id, request, principal);
    }
}
