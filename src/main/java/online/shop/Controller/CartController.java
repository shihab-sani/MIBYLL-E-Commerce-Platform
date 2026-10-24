package online.shop.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import online.shop.DTOs.CartDtos.*;
import online.shop.Entity.User;
import online.shop.Services.AuthService;
import online.shop.Services.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartDto> get(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(cartService.getCart(ud.getUsername()));
    }

    @PostMapping("/items")
    public ResponseEntity<CartDto> add(@AuthenticationPrincipal UserDetails ud,
                                       @Valid @RequestBody AddToCartRequest req) {
        return ResponseEntity.ok(cartService.addItem(ud.getUsername(), req));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartDto> update(@AuthenticationPrincipal UserDetails ud,
                                          @PathVariable UUID itemId,
                                          @Valid @RequestBody UpdateCartItemRequest req) {
        return ResponseEntity.ok(cartService.updateItem(ud.getUsername(), itemId, req.quantity(), req.size(), req.variantName()));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartDto> remove(@AuthenticationPrincipal UserDetails ud,
                                          @PathVariable UUID itemId) {
        return ResponseEntity.ok(cartService.removeItem(ud.getUsername(), itemId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clear(@AuthenticationPrincipal UserDetails ud) {
        cartService.clearCart(ud.getUsername());
        return ResponseEntity.noContent().build();
    }
}
