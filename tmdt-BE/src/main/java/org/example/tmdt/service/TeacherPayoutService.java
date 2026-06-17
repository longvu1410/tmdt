package org.example.tmdt.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.example.tmdt.dto.CreateWithdrawalRequest;
import org.example.tmdt.dto.ProcessWithdrawalRequest;
import org.example.tmdt.dto.TeacherQuarterRevenueResponse;
import org.example.tmdt.dto.WithdrawalResponse;
import org.example.tmdt.entity.AppUser;
import org.example.tmdt.entity.OrderStatus;
import org.example.tmdt.entity.TeacherWithdrawalRequest;
import org.example.tmdt.entity.WithdrawalStatus;
import org.example.tmdt.exception.BadRequestException;
import org.example.tmdt.exception.NotFoundException;
import org.example.tmdt.repository.AppUserRepository;
import org.example.tmdt.repository.CourseOrderRepository;
import org.example.tmdt.repository.TeacherWithdrawalRequestRepository;
import org.example.tmdt.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TeacherPayoutService {

    private final AppUserRepository appUserRepository;
    private final CourseOrderRepository courseOrderRepository;
    private final TeacherWithdrawalRequestRepository withdrawalRepository;

    @Transactional(readOnly = true)
    public TeacherQuarterRevenueResponse getMyQuarterRevenue(Integer year, Integer quarter, UserPrincipal principal) {
        AppUser teacher = getUser(principal.getId(), "Teacher account not found");
        return buildQuarterRevenue(teacher, year, quarter);
    }

    @Transactional(readOnly = true)
    public TeacherQuarterRevenueResponse getTeacherQuarterRevenue(Long teacherId, Integer year, Integer quarter) {
        AppUser teacher = getUser(teacherId, "Teacher not found");
        return buildQuarterRevenue(teacher, year, quarter);
    }

    @Transactional(readOnly = true)
    public List<WithdrawalResponse> getMyWithdrawals(UserPrincipal principal) {
        return withdrawalRepository.findByTeacher_IdOrderByCreatedAtDesc(principal.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<WithdrawalResponse> getWithdrawals() {
        return withdrawalRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public WithdrawalResponse createWithdrawal(CreateWithdrawalRequest request, UserPrincipal principal) {
        AppUser teacher = getUser(principal.getId(), "Teacher account not found");
        
        LocalDate now = LocalDate.now(ZoneOffset.UTC);
        int currentYear = now.getYear();
        int currentQuarter = (now.getMonthValue() - 1) / 3 + 1;

        TeacherQuarterRevenueResponse revenue = buildQuarterRevenue(teacher, currentYear, currentQuarter);
        if (request.getAmount().compareTo(revenue.getAvailableAmount()) > 0) {
            throw new BadRequestException("Withdrawal amount exceeds available teacher revenue");
        }

        TeacherWithdrawalRequest withdrawal = withdrawalRepository.save(TeacherWithdrawalRequest.builder()
                .teacher(teacher)
                .year(currentYear)
                .quarter(currentQuarter)
                .amount(request.getAmount())
                .bankName(request.getBankName().trim())
                .bankAccountNumber(request.getBankAccountNumber().trim())
                .bankAccountName(request.getBankAccountName().trim())
                .note(trimToNull(request.getNote()))
                .status(WithdrawalStatus.PENDING)
                .build());
        return toResponse(withdrawal);
    }

    @Transactional
    public WithdrawalResponse approveWithdrawal(Long id, ProcessWithdrawalRequest request, UserPrincipal principal) {
        TeacherWithdrawalRequest withdrawal = getPendingWithdrawal(id);
        AppUser admin = getUser(principal.getId(), "Admin account not found");
        withdrawal.setStatus(WithdrawalStatus.APPROVED);
        withdrawal.setProcessedByAdmin(admin);
        withdrawal.setAdminNote(request == null ? null : trimToNull(request.getAdminNote()));
        withdrawal.setProcessedAt(Instant.now());
        return toResponse(withdrawal);
    }

    @Transactional
    public WithdrawalResponse rejectWithdrawal(Long id, ProcessWithdrawalRequest request, UserPrincipal principal) {
        TeacherWithdrawalRequest withdrawal = getPendingWithdrawal(id);
        AppUser admin = getUser(principal.getId(), "Admin account not found");
        withdrawal.setStatus(WithdrawalStatus.REJECTED);
        withdrawal.setProcessedByAdmin(admin);
        withdrawal.setAdminNote(request == null ? null : trimToNull(request.getAdminNote()));
        withdrawal.setProcessedAt(Instant.now());
        return toResponse(withdrawal);
    }

    private TeacherQuarterRevenueResponse buildQuarterRevenue(AppUser teacher, Integer year, Integer quarter) {
        validatePeriod(year, quarter);
        QuarterRange range = toQuarterRange(year, quarter);
        BigDecimal grossRevenue = courseOrderRepository.sumTotalAmountByTeacherAndStatusAndPaidAtBetween(
                teacher.getId(),
                OrderStatus.PAID,
                range.start(),
                range.end());
        long paidOrderCount = courseOrderRepository.countByCourse_Teacher_IdAndStatusAndPaidAtBetween(
                teacher.getId(),
                OrderStatus.PAID,
                range.start(),
                range.end());
        BigDecimal pendingWithdrawalAmount = withdrawalRepository.sumAmountByTeacherAndPeriodAndStatuses(
                teacher.getId(),
                year,
                quarter,
                List.of(WithdrawalStatus.PENDING));
        BigDecimal approvedWithdrawalAmount = withdrawalRepository.sumAmountByTeacherAndPeriodAndStatuses(
                teacher.getId(),
                year,
                quarter,
                List.of(WithdrawalStatus.APPROVED));
        BigDecimal requestedOrPaidAmount = withdrawalRepository.sumAmountByTeacherAndPeriodAndStatuses(
                teacher.getId(),
                year,
                quarter,
                List.of(WithdrawalStatus.PENDING, WithdrawalStatus.APPROVED));
        BigDecimal cumulativeGrossRevenue = courseOrderRepository.sumTotalAmountByTeacherAndStatusAndPaidAtBefore(
                teacher.getId(),
                OrderStatus.PAID,
                range.end());
        BigDecimal allTimeRequestedOrPaidAmount = withdrawalRepository.sumAmountByTeacherAndStatuses(
                teacher.getId(),
                List.of(WithdrawalStatus.PENDING, WithdrawalStatus.APPROVED));
        BigDecimal allTimeApprovedWithdrawalAmount = withdrawalRepository.sumAmountByTeacherAndStatuses(
                teacher.getId(),
                List.of(WithdrawalStatus.APPROVED));

        BigDecimal availableAmount = cumulativeGrossRevenue.subtract(allTimeRequestedOrPaidAmount).max(BigDecimal.ZERO);
        BigDecimal platformBalance = cumulativeGrossRevenue.subtract(allTimeApprovedWithdrawalAmount).max(BigDecimal.ZERO);

        return TeacherQuarterRevenueResponse.builder()
                .teacherId(teacher.getId())
                .teacherName(resolveUserName(teacher))
                .year(year)
                .quarter(quarter)
                .periodStart(range.start())
                .periodEnd(range.end())
                .paidOrderCount(paidOrderCount)
                .grossRevenue(grossRevenue)
                .pendingWithdrawalAmount(pendingWithdrawalAmount)
                .approvedWithdrawalAmount(approvedWithdrawalAmount)
                .requestedOrPaidAmount(requestedOrPaidAmount)
                .availableAmount(availableAmount)
                .platformBalance(platformBalance)
                .build();
    }

    private TeacherWithdrawalRequest getPendingWithdrawal(Long id) {
        TeacherWithdrawalRequest withdrawal = withdrawalRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Withdrawal request not found"));
        if (withdrawal.getStatus() != WithdrawalStatus.PENDING) {
            throw new BadRequestException("Only pending withdrawal requests can be processed");
        }
        return withdrawal;
    }

    private AppUser getUser(Long id, String message) {
        return appUserRepository.findById(id)
                .orElseThrow(() -> new BadRequestException(message));
    }

    private void validatePeriod(Integer year, Integer quarter) {
        if (year == null || year < 2000) {
            throw new BadRequestException("Year is invalid");
        }
        if (quarter == null || quarter < 1 || quarter > 4) {
            throw new BadRequestException("Quarter must be from 1 to 4");
        }
    }

    private QuarterRange toQuarterRange(Integer year, Integer quarter) {
        int startMonth = (quarter - 1) * 3 + 1;
        Instant start = LocalDate.of(year, startMonth, 1)
                .atStartOfDay()
                .toInstant(ZoneOffset.UTC);
        Instant end = LocalDate.of(year, startMonth, 1)
                .plusMonths(3)
                .atStartOfDay()
                .toInstant(ZoneOffset.UTC);
        return new QuarterRange(start, end);
    }

    private WithdrawalResponse toResponse(TeacherWithdrawalRequest withdrawal) {
        TeacherQuarterRevenueResponse revenue = buildQuarterRevenue(
                withdrawal.getTeacher(),
                withdrawal.getYear(),
                withdrawal.getQuarter());
        return WithdrawalResponse.builder()
                .id(withdrawal.getId())
                .teacherId(withdrawal.getTeacher().getId())
                .teacherName(resolveUserName(withdrawal.getTeacher()))
                .year(withdrawal.getYear())
                .quarter(withdrawal.getQuarter())
                .amount(withdrawal.getAmount())
                .bankName(withdrawal.getBankName())
                .bankAccountNumber(withdrawal.getBankAccountNumber())
                .bankAccountName(withdrawal.getBankAccountName())
                .note(withdrawal.getNote())
                .status(withdrawal.getStatus().name())
                .availableAmount(revenue.getAvailableAmount())
                .platformBalance(revenue.getPlatformBalance())
                .processedByAdminId(withdrawal.getProcessedByAdmin() == null ? null : withdrawal.getProcessedByAdmin().getId())
                .processedByAdminName(withdrawal.getProcessedByAdmin() == null ? null : resolveUserName(withdrawal.getProcessedByAdmin()))
                .adminNote(withdrawal.getAdminNote())
                .createdAt(withdrawal.getCreatedAt())
                .processedAt(withdrawal.getProcessedAt())
                .build();
    }

    private String resolveUserName(AppUser user) {
        if (user.getDisplayName() != null && !user.getDisplayName().isBlank()) {
            return user.getDisplayName().trim();
        }
        return user.getUsername();
    }

    private String trimToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }

    private record QuarterRange(Instant start, Instant end) {
    }
}
