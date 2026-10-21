package online.shop.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import online.shop.DTOs.CustomerDtos.*;
import online.shop.DTOs.CategoryDtos.*;
import online.shop.DTOs.DashboardDto.*;
import online.shop.DTOs.BannerDtos.*;
import online.shop.DTOs.OrderDtos.*;
import online.shop.DTOs.ProductDtos.*;
import online.shop.Entity.SiteSettings;
import online.shop.Services.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final ProductService productService;
    private final CategoryService categoryService;
    private final OrderService orderService;
    private final AdminService adminService;
    private final BannerService bannerService;
    private final AuditService auditService;
    private final SiteSettingsService siteSettingsService;

    /* ---------------- DASHBOARD ---------------- */

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> dashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }

    /* ============================================================
       PRODUCTS
       ============================================================ */

    @GetMapping("/products")                                        // <-- RESTORED
    public ResponseEntity<List<ProductDto>> allProducts() {
        return ResponseEntity.ok(productService.adminListAll());
    }

    @PostMapping("/products")
    public ResponseEntity<ProductDto> createProduct(@AuthenticationPrincipal UserDetails ud,
                                                    @Valid @RequestBody ProductRequest req) {
        ProductDto created = productService.create(req);
        auditService.log(ud.getUsername(), roleOf(ud), "PRODUCT_CREATED", "PRODUCT",
                String.valueOf(created.id()), created.name());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ProductDto> updateProduct(@AuthenticationPrincipal UserDetails ud,
                                                    @PathVariable UUID id,
                                                    @Valid @RequestBody ProductRequest req) {
        ProductDto updated = productService.update(id, req);
        auditService.log(ud.getUsername(), roleOf(ud), "PRODUCT_UPDATED", "PRODUCT",
                String.valueOf(id), updated.name());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@AuthenticationPrincipal UserDetails ud,
                                              @PathVariable UUID id) {
        productService.delete(id);
        auditService.log(ud.getUsername(), roleOf(ud), "PRODUCT_DELETED", "PRODUCT",
                String.valueOf(id), null);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/products/{id}/price")
    public ResponseEntity<ProductDto> updatePrice(@AuthenticationPrincipal UserDetails ud,
                                                  @PathVariable UUID id,
                                                  @Valid @RequestBody PriceUpdateRequest req) {
        ProductDto updated = productService.updatePrice(id, req.price());
        auditService.log(ud.getUsername(), roleOf(ud), "PRODUCT_PRICE_UPDATED", "PRODUCT",
                String.valueOf(id), "New price: " + req.price());
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/products/{id}/discount")
    public ResponseEntity<ProductDto> updateDiscount(@AuthenticationPrincipal UserDetails ud,
                                                     @PathVariable UUID id,
                                                     @Valid @RequestBody DiscountUpdateRequest req) {
        ProductDto updated = productService.updateDiscount(id, req.discountPercent());
        auditService.log(ud.getUsername(), roleOf(ud), "PRODUCT_DISCOUNT_UPDATED", "PRODUCT",
                String.valueOf(id), "New discount: " + req.discountPercent() + "%");
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/products/{id}/stock")
    public ResponseEntity<ProductDto> updateStock(@AuthenticationPrincipal UserDetails ud,
                                                  @PathVariable UUID id,
                                                  @Valid @RequestBody StockUpdateRequest req) {
        ProductDto updated = productService.updateStock(id, req.stockQuantity());
        auditService.log(ud.getUsername(), roleOf(ud), "PRODUCT_STOCK_UPDATED", "PRODUCT",
                String.valueOf(id), "New stock: " + req.stockQuantity());
        return ResponseEntity.ok(updated);
    }

    /* ============================================================
       CATEGORIES
       ============================================================ */

    @PostMapping("/categories")
    public ResponseEntity<CategoryDto> createCategory(@AuthenticationPrincipal UserDetails ud,
                                                      @Valid @RequestBody CategoryRequest req) {
        CategoryDto created = categoryService.create(req);
        auditService.log(ud.getUsername(), roleOf(ud), "CATEGORY_CREATED", "CATEGORY",
                String.valueOf(created.id()), created.name());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<CategoryDto> updateCategory(@AuthenticationPrincipal UserDetails ud,
                                                      @PathVariable UUID id,
                                                      @Valid @RequestBody CategoryRequest req) {
        CategoryDto updated = categoryService.update(id, req);
        auditService.log(ud.getUsername(), roleOf(ud), "CATEGORY_UPDATED", "CATEGORY",
                String.valueOf(id), updated.name());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@AuthenticationPrincipal UserDetails ud,
                                               @PathVariable UUID id) {
        categoryService.delete(id);
        auditService.log(ud.getUsername(), roleOf(ud), "CATEGORY_DELETED", "CATEGORY",
                String.valueOf(id), null);
        return ResponseEntity.noContent().build();
    }

    /* ============================================================
       ORDERS
       ============================================================ */

    @GetMapping("/orders")                                          // <-- RESTORED
    public ResponseEntity<List<OrderDto>> allOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(orderService.allOrders(page, size));
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<OrderDto> updateOrderStatus(@AuthenticationPrincipal UserDetails ud,
                                                      @PathVariable UUID id,
                                                      @RequestBody UpdateStatusRequest req) {
        OrderDto updated = orderService.updateStatus(id, req.status());
        auditService.log(ud.getUsername(), roleOf(ud), "ORDER_STATUS_CHANGED", "ORDER",
                String.valueOf(id), "Status → " + req.status());
        return ResponseEntity.ok(updated);
    }

    /* ============================================================
       BANNERS
       ============================================================ */

    @GetMapping("/banners")                                         // <-- RESTORED
    public ResponseEntity<List<BannerDto>> allBanners() {
        return ResponseEntity.ok(bannerService.getAll());
    }

    @PostMapping("/banners")
    public ResponseEntity<BannerDto> createBanner(@AuthenticationPrincipal UserDetails ud,
                                                  @Valid @RequestBody BannerRequest req) {
        BannerDto created = bannerService.create(req);
        auditService.log(ud.getUsername(), roleOf(ud), "BANNER_CREATED", "BANNER",
                String.valueOf(created.id()), created.title());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/banners/{id}")
    public ResponseEntity<BannerDto> updateBanner(@AuthenticationPrincipal UserDetails ud,
                                                  @PathVariable UUID id,
                                                  @Valid @RequestBody BannerRequest req) {
        BannerDto updated = bannerService.update(id, req);
        auditService.log(ud.getUsername(), roleOf(ud), "BANNER_UPDATED", "BANNER",
                String.valueOf(id), updated.title());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/banners/{id}")
    public ResponseEntity<Void> deleteBanner(@AuthenticationPrincipal UserDetails ud,
                                             @PathVariable UUID id) {
        bannerService.delete(id);
        auditService.log(ud.getUsername(), roleOf(ud), "BANNER_DELETED", "BANNER",
                String.valueOf(id), null);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/banners/{id}/move")
    public ResponseEntity<BannerDto> moveBanner(@AuthenticationPrincipal UserDetails ud,
                                                @PathVariable UUID id,
                                                @RequestParam int direction) {
        BannerDto updated = bannerService.move(id, direction);
        auditService.log(ud.getUsername(), roleOf(ud), "BANNER_MOVED", "BANNER",
                String.valueOf(id), "direction=" + direction);
        return ResponseEntity.ok(updated);
    }

    /* ============================================================
       CUSTOMERS
       ============================================================ */

    @GetMapping("/customers")                                       // <-- RESTORED
    public ResponseEntity<List<CustomerDto>> customers() {
        return ResponseEntity.ok(adminService.getCustomers());
    }

    /* ---------------- helper ---------------- */

    private String roleOf(UserDetails ud) {
        return ud.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse("ROLE_SUBADMIN");
    }

    @GetMapping("/site/footer")
    public ResponseEntity<SiteSettings> getFooter() {
        return ResponseEntity.ok(siteSettingsService.get());
    }

    @PutMapping("/site/footer")
    public ResponseEntity<SiteSettings> updateFooter(@AuthenticationPrincipal UserDetails ud,
                                                     @RequestBody SiteSettings req) {
        SiteSettings updated = siteSettingsService.update(req);
        auditService.log(ud.getUsername(), roleOf(ud), "FOOTER_UPDATED", "SITE", "1", null);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/orders/{id}/approve-refund")
    public ResponseEntity<OrderDto> approveRefund(@AuthenticationPrincipal UserDetails ud, @PathVariable UUID id) {
        OrderDto updated = orderService.approveRefund(id);
        auditService.log(ud.getUsername(), roleOf(ud), "REFUND_APPROVED", "ORDER", String.valueOf(id), null);
        return ResponseEntity.ok(updated);
    }

    public record RejectionRequest(String reason) {}

    @PatchMapping("/orders/{id}/reject-refund")
    public ResponseEntity<OrderDto> rejectRefund(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable UUID id,
            @RequestBody RejectionRequest req) {
        OrderDto updated = orderService.rejectRefund(id, req.reason());
        auditService.log(ud.getUsername(), roleOf(ud), "REFUND_REJECTED", "ORDER", String.valueOf(id), null);
        return ResponseEntity.ok(updated);
    }
}
