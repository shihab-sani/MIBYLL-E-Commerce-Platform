package online.shop.Controller;

import lombok.RequiredArgsConstructor;
import online.shop.DTOs.ProductDtos;
import online.shop.Services.WishListService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishListController {
    private final WishListService wishlistService;

    @GetMapping
    public ResponseEntity<List<ProductDtos.ProductDto>> getWishlist(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(wishlistService.getWishlist(ud.getUsername()));
    }

    @GetMapping("/ids")
    public ResponseEntity<List<UUID>> getWishlistIds(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(wishlistService.getWishlistIds(ud.getUsername()));
    }

    @PostMapping("/{productId}/toggle")
    public ResponseEntity<Void> toggleWishlist(@AuthenticationPrincipal UserDetails ud, @PathVariable UUID productId) {
        wishlistService.toggleWishlist(ud.getUsername(), productId);
        return ResponseEntity.ok().build();
    }
}
