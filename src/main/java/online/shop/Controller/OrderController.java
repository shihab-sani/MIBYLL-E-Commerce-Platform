package online.shop.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import online.shop.DTOs.OrderDtos.*;
import online.shop.Entity.User;
import online.shop.Services.AuthService;
import online.shop.Services.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderDto> place(@AuthenticationPrincipal UserDetails ud,
                                          @Valid @RequestBody PlaceOrderRequest req) {
        return ResponseEntity.ok(orderService.placeOrder(ud.getUsername(), req));
    }

    @GetMapping
    public ResponseEntity<List<OrderDto>> myOrders(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(orderService.myOrders(ud.getUsername()));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<OrderDto> cancelOrder(@AuthenticationPrincipal UserDetails ud, @PathVariable UUID id) {
        return ResponseEntity.ok(orderService.cancelOrder(ud.getUsername(), id));
    }

    public record RefundRequest(String reason) {}

    @PostMapping("/{id}/refund")
    public ResponseEntity<OrderDto> requestRefund(@AuthenticationPrincipal UserDetails ud, @PathVariable UUID id, @RequestBody RefundRequest req) {
        return ResponseEntity.ok(orderService.requestRefund(ud.getUsername(), id, req.reason()));
    }

    @PatchMapping("/{id}/cancel-refund")
    public ResponseEntity<OrderDto> cancelRefund(@AuthenticationPrincipal UserDetails ud, @PathVariable UUID id) {
        return ResponseEntity.ok(orderService.cancelRefundRequest(ud.getUsername(), id));
    }
}
