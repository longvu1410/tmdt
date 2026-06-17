package org.example.tmdt.controller;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.example.tmdt.dto.CheckoutRequest;
import org.example.tmdt.dto.CourseOrderResponse;
import org.example.tmdt.dto.OrderPriceResponse;
import org.example.tmdt.dto.PayOrderRequest;
import org.example.tmdt.security.UserPrincipal;
import org.example.tmdt.service.OrderService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/preview")
    @PreAuthorize("hasRole('STUDENT')")
    public OrderPriceResponse preview(@Valid @RequestBody CheckoutRequest request) {
        return orderService.preview(request);
    }

    @PostMapping("/checkout")
    @PreAuthorize("hasRole('STUDENT')")
    public CourseOrderResponse checkout(
            @Valid @RequestBody CheckoutRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return orderService.checkout(request, principal);
    }

    @PostMapping("/{id}/pay")
    @PreAuthorize("hasRole('STUDENT')")
    public CourseOrderResponse payOrder(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) PayOrderRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return orderService.payOrder(id, request, principal);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('STUDENT')")
    public CourseOrderResponse cancelOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return orderService.cancelOrder(id, principal);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public List<CourseOrderResponse> getMyOrders(@AuthenticationPrincipal UserPrincipal principal) {
        return orderService.getMyOrders(principal);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    public CourseOrderResponse getMyOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return orderService.getMyOrder(id, principal);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<CourseOrderResponse> getOrders() {
        return orderService.getOrders();
    }
}
