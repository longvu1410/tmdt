package org.example.tmdt.controller;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.example.tmdt.dto.VoucherRequest;
import org.example.tmdt.dto.VoucherResponse;
import org.example.tmdt.service.VoucherService;
import org.springframework.security.access.prepost.PreAuthorize;
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
@PreAuthorize("hasRole('ADMIN')")
public class VoucherController {

    private final VoucherService voucherService;

    @GetMapping
    public List<VoucherResponse> getVouchers() {
        return voucherService.getVouchers();
    }

    @PostMapping
    public VoucherResponse createVoucher(@Valid @RequestBody VoucherRequest request) {
        return voucherService.createVoucher(request);
    }

    @PutMapping("/{id}")
    public VoucherResponse updateVoucher(@PathVariable Long id, @Valid @RequestBody VoucherRequest request) {
        return voucherService.updateVoucher(id, request);
    }

    @DeleteMapping("/{id}")
    public VoucherResponse deactivateVoucher(@PathVariable Long id) {
        return voucherService.deactivateVoucher(id);
    }
}
