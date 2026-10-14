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
}
