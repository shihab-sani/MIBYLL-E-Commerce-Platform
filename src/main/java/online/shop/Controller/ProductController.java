package online.shop.Controller;

import lombok.RequiredArgsConstructor;
import online.shop.DTOs.ProductDtos.*;
import online.shop.Services.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Page<ProductDto>> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "newest") String sort) {
        return ResponseEntity.ok(productService.search(category, q, minPrice, maxPrice, page, size, sort));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ProductDto> bySlug(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getBySlug(slug));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<ProductDto>> featured(@RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(productService.getFeatured(limit));
    }

    @GetMapping("/new-arrivals")
    public ResponseEntity<List<ProductDto>> newArrivals(@RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(productService.getNewArrivals(limit));
    }

}
