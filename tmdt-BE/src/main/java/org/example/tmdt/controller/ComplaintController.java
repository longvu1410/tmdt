package org.example.tmdt.controller;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.example.tmdt.dto.ComplaintResponse;
import org.example.tmdt.dto.CreateComplaintRequest;
import org.example.tmdt.dto.HandleComplaintRequest;
import org.example.tmdt.enums.ComplaintStatus;
import org.example.tmdt.security.UserPrincipal;
import org.example.tmdt.service.ComplaintService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    /** Student: Submit a complaint about a purchased course */
    @PostMapping("/courses/{courseId}")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('STUDENT')")
    public ComplaintResponse createComplaint(
            @PathVariable Long courseId,
            @Valid @RequestBody CreateComplaintRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return complaintService.createComplaint(courseId, request, principal);
    }

    /** Student: View all my complaints */
    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public List<ComplaintResponse> getMyComplaints(@AuthenticationPrincipal UserPrincipal principal) {
        return complaintService.getMyComplaints(principal);
    }

    /** Student: View my complaints for a specific course */
    @GetMapping("/my/courses/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public List<ComplaintResponse> getMyComplaintsForCourse(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return complaintService.getMyComplaintsForCourse(courseId, principal);
    }

    /** Admin: Get all complaints (optionally filter by status) */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<ComplaintResponse> getAllComplaints(
            @RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            try {
                return complaintService.getComplaintsByStatus(ComplaintStatus.valueOf(status.toUpperCase()));
            } catch (IllegalArgumentException e) {
                return complaintService.getAllComplaints();
            }
        }
        return complaintService.getAllComplaints();
    }

    /** Admin: Handle (resolve/reject/review) a complaint */
    @PutMapping("/{id}/handle")
    @PreAuthorize("hasRole('ADMIN')")
    public ComplaintResponse handleComplaint(
            @PathVariable Long id,
            @Valid @RequestBody HandleComplaintRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return complaintService.handleComplaint(id, request, principal);
    }
}
