package online.shop.Controller;

import lombok.RequiredArgsConstructor;
import online.shop.DTOs.ProductDtos.*;
import online.shop.DTOs.ReviewDtos;
import online.shop.Services.ProductService;
import online.shop.Services.ReviewService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;
    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<Page<ProductDto>> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "newest") String sort) {
        return ResponseEntity.ok(productService.search(category, q, featured, page, size, sort));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ProductDto> bySlug(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getBySlug(slug));
    }

    @GetMapping("/{slug}/related")
    public ResponseEntity<List<ProductDto>> related(@PathVariable String slug) {
        ProductDto current = productService.getBySlug(slug);
        return ResponseEntity.ok(productService.getRelated(current.id(), current.categoryId()));
    }

    @GetMapping("/{slug}/reviews")
    public ResponseEntity<List<ReviewDtos.ReviewDto>> getReviews(@PathVariable String slug) {
        ProductDto product = productService.getBySlug(slug);
        return ResponseEntity.ok(reviewService.getReviews(product.id()));
    }

    @PostMapping("/{slug}/reviews")
    public ResponseEntity<Void> addReview(@AuthenticationPrincipal UserDetails ud,
                                          @PathVariable String slug,
                                          @RequestBody ReviewDtos.ReviewRequest req) {
        ProductDto product = productService.getBySlug(slug);
        reviewService.addReview(ud.getUsername(), product.id(), req);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{slug}/reviews/{reviewId}")
    public ResponseEntity<Void> updateReview(@AuthenticationPrincipal UserDetails ud,
                                             @PathVariable UUID reviewId,
                                             @RequestBody ReviewDtos.ReviewRequest req) {
        reviewService.updateReview(ud.getUsername(), reviewId, req);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{slug}/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(@AuthenticationPrincipal UserDetails ud,
                                             @PathVariable UUID reviewId) {
        reviewService.deleteReview(ud.getUsername(), reviewId);
        return ResponseEntity.ok().build();
    }
}
