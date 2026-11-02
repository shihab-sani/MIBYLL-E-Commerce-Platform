package online.shop.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import online.shop.DTOs.OrderDtos.*;
import online.shop.DTOs.RequestDtos.*;
import online.shop.Services.OrderService;
import online.shop.Services.RequestService;
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
    private final RequestService requestService;

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

    @PostMapping("/requests")
    public ResponseEntity<Void> createRequest(@AuthenticationPrincipal UserDetails ud, @RequestBody CreateRequestDto req) {
        requestService.createRequest(ud.getUsername(), req);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/requests")
    public ResponseEntity<List<RequestDto>> myRequests(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(requestService.getMyRequests(ud.getUsername()));
    }

    @PostMapping("/requests/{id}/reply")
    public ResponseEntity<Void> replyToRequest(@PathVariable UUID id, @RequestBody ReplyRequestDto req) {
        requestService.reply(id, "CUSTOMER", req.message());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/requests/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable UUID id) {
        requestService.markAsRead(id, "CUSTOMER");
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/requests/read-all")
    public ResponseEntity<Void> markAllRead(@AuthenticationPrincipal UserDetails ud) {
        requestService.markAllAsRead(ud.getUsername(), "CUSTOMER");
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/requests/{id}/close")
    public ResponseEntity<Void> closeRequest(@PathVariable UUID id) {
        requestService.closeRequest(id);
        return ResponseEntity.ok().build();
    }
}
