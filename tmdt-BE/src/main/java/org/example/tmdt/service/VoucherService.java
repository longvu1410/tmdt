package org.example.tmdt.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.example.tmdt.dto.VoucherRequest;
import org.example.tmdt.dto.VoucherResponse;
import org.example.tmdt.entity.Voucher;
import org.example.tmdt.enums.VoucherDiscountType;
import org.example.tmdt.exception.BadRequestException;
import org.example.tmdt.exception.NotFoundException;
import org.example.tmdt.repository.VoucherRepository;
import org.example.tmdt.entity.AppUser;
import org.example.tmdt.repository.AppUserRepository;
import org.example.tmdt.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VoucherService {

    private final VoucherRepository voucherRepository;
    private final AppUserRepository appUserRepository;

    @Transactional(readOnly = true)
    public List<VoucherResponse> getVouchers() {
        return voucherRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public VoucherResponse createVoucher(VoucherRequest request) {
        String code = normalizeCode(request.getCode());
        if (voucherRepository.existsByCode(code)) {
            throw new BadRequestException("Voucher code already exists");
        }
        Voucher voucher = Voucher.builder().build();
        applyRequest(voucher, request, code);
        return toResponse(voucherRepository.save(voucher));
    }

    @Transactional
    public VoucherResponse updateVoucher(Long id, VoucherRequest request) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Voucher not found"));
        String code = normalizeCode(request.getCode());
        if (!voucher.getCode().equals(code) && voucherRepository.existsByCode(code)) {
            throw new BadRequestException("Voucher code already exists");
        }
        applyRequest(voucher, request, code);
        return toResponse(voucher);
    }

    @Transactional
    public VoucherResponse deactivateVoucher(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Voucher not found"));
        voucher.setActive(false);
        return toResponse(voucher);
    }

    @Transactional(readOnly = true)
    public List<VoucherResponse> getTeacherVouchers(UserPrincipal principal) {
        return voucherRepository.findByTeacher_IdOrderByCreatedAtDesc(principal.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public VoucherResponse createTeacherVoucher(VoucherRequest request, UserPrincipal principal) {
        String code = normalizeCode(request.getCode());
        if (voucherRepository.existsByCode(code)) {
            throw new BadRequestException("Voucher code already exists");
        }
        AppUser teacher = appUserRepository.findById(principal.getId())
                .orElseThrow(() -> new BadRequestException("Teacher account not found"));
        Voucher voucher = Voucher.builder().build();
        applyRequest(voucher, request, code);
        voucher.setTeacher(teacher);
        return toResponse(voucherRepository.save(voucher));
    }

    @Transactional
    public VoucherResponse updateTeacherVoucher(Long id, VoucherRequest request, UserPrincipal principal) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Voucher not found"));
        if (voucher.getTeacher() == null || !voucher.getTeacher().getId().equals(principal.getId())) {
            throw new BadRequestException("You do not have permission to edit this voucher");
        }
        String code = normalizeCode(request.getCode());
        if (!voucher.getCode().equals(code) && voucherRepository.existsByCode(code)) {
            throw new BadRequestException("Voucher code already exists");
        }
        applyRequest(voucher, request, code);
        return toResponse(voucher);
    }

    @Transactional
    public VoucherResponse deactivateTeacherVoucher(Long id, UserPrincipal principal) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Voucher not found"));
        if (voucher.getTeacher() == null || !voucher.getTeacher().getId().equals(principal.getId())) {
            throw new BadRequestException("You do not have permission to deactivate this voucher");
        }
        voucher.setActive(false);
        return toResponse(voucher);
    }

    private void applyRequest(Voucher voucher, VoucherRequest request, String code) {
        VoucherDiscountType discountType = parseDiscountType(request.getDiscountType());
        if (discountType == VoucherDiscountType.PERCENT
                && request.getDiscountValue().compareTo(new BigDecimal("100")) > 0) {
            throw new BadRequestException("Percent discount cannot be greater than 100");
        }
        if (request.getStartsAt() != null && request.getExpiresAt() != null
                && !request.getStartsAt().isBefore(request.getExpiresAt())) {
            throw new BadRequestException("Voucher start time must be before expiry time");
        }

        voucher.setCode(code);
        voucher.setName(request.getName().trim());
        voucher.setDiscountType(discountType);
        voucher.setDiscountValue(request.getDiscountValue());
        voucher.setMaxDiscountAmount(request.getMaxDiscountAmount());
        voucher.setMinOrderAmount(request.getMinOrderAmount() == null ? BigDecimal.ZERO : request.getMinOrderAmount());
        voucher.setUsageLimit(request.getUsageLimit());
        voucher.setActive(request.getActive() == null || request.getActive());
        voucher.setStartsAt(request.getStartsAt());
        voucher.setExpiresAt(request.getExpiresAt());
        voucher.setApplicableCourseIds(request.getApplicableCourseIds());
        if (voucher.getUsedCount() == null) {
            voucher.setUsedCount(0);
        }
    }

    private VoucherDiscountType parseDiscountType(String discountType) {
        try {
            return VoucherDiscountType.valueOf(discountType.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Voucher discountType must be PERCENT or FIXED");
        }
    }

    private String normalizeCode(String code) {
        return code.trim().toUpperCase();
    }

    private VoucherResponse toResponse(Voucher voucher) {
        return VoucherResponse.builder()
                .id(voucher.getId())
                .code(voucher.getCode())
                .name(voucher.getName())
                .discountType(voucher.getDiscountType().name())
                .discountValue(voucher.getDiscountValue())
                .maxDiscountAmount(voucher.getMaxDiscountAmount())
                .minOrderAmount(voucher.getMinOrderAmount())
                .usageLimit(voucher.getUsageLimit())
                .usedCount(voucher.getUsedCount())
                .active(voucher.getActive())
                .startsAt(voucher.getStartsAt())
                .expiresAt(voucher.getExpiresAt())
                .teacherId(voucher.getTeacher() != null ? voucher.getTeacher().getId() : null)
                .teacherName(voucher.getTeacher() != null ? (voucher.getTeacher().getDisplayName() != null ? voucher.getTeacher().getDisplayName() : voucher.getTeacher().getUsername()) : "Admin")
                .applicableCourseIds(voucher.getApplicableCourseIds())
                .build();
    }
}
