package online.shop.Services;

import lombok.RequiredArgsConstructor;
import online.shop.DTOs.ProductDtos.*;
import online.shop.Entity.Categories;
import online.shop.Entity.Product;
import online.shop.Entity.ProductImage;
import online.shop.Entity.ProductVariant;
import online.shop.ExceptionsHandler.ApiException;
import online.shop.Repositories.CartItemRepository;
import online.shop.Repositories.CategoryRepository;
import online.shop.Repositories.OrderItemRepository;
import online.shop.Repositories.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;
    private final CartItemRepository cartItemRepository;
    private final OrderItemRepository orderItemRepository;

    /* ------------ PUBLIC READ ------------ */

    @Transactional(readOnly = true)
    public Page<ProductDto> search(String categorySlug, String q, BigDecimal minPrice,
                                   BigDecimal maxPrice, int page, int size, String sort) {

        Sort sorting = switch (sort == null ? "" : sort) {
            case "price_asc"  -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "name_asc"   -> Sort.by(Sort.Direction.ASC, "name");
            default           -> Sort.by(Sort.Direction.DESC, "createdAt");
        };

        Pageable pageable = PageRequest.of(page, size, sorting);
        String cat = (categorySlug == null || categorySlug.isBlank()) ? null : categorySlug;
        String query = (q == null || q.isBlank()) ? null : q.trim();

        return productRepository.search(cat, query, minPrice, maxPrice, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public ProductDto getBySlug(String slug) {
        Product p = productRepository.findBySlug(slug)
                .orElseThrow(() -> ApiException.notFound("Product not found"));
        if (!p.isActive()) throw ApiException.notFound("Product not available");
        return toDto(p);
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getFeatured(int limit) {
        return productRepository.findByFeaturedTrueAndActiveTrueOrderByCreatedAtDesc(PageRequest.of(0, limit))
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getNewArrivals(int limit) {
        return productRepository.findByNewArrivalTrueAndActiveTrueOrderByCreatedAtDesc(PageRequest.of(0, limit))
                .stream().map(this::toDto).toList();
    }

    /* ------------ ADMIN CRUD ------------ */

    @Transactional(readOnly = true)
    public List<ProductDto> adminListAll() {
        return productRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public ProductDto create(ProductRequest req) {
        String baseSlug = (req.slug() != null && !req.slug().isBlank())
                ? CategoryService.slugify(req.slug())
                : CategoryService.slugify(req.name());

        String slug = baseSlug;
        int i = 1;
        while (productRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + i++;
        }

        Product p = Product.builder()
                .name(req.name())
                .slug(slug)
                .description(req.description())
                .price(req.price())
                .discountPercent(req.discountPercent() == null ? 0 : req.discountPercent())
                .stockQuantity(req.stockQuantity())
                .brand(req.brand())
                .featured(req.featured())
                .newArrival(req.newArrival())
                .active(req.active() == null || req.active())
                .build();

        p.setSizeType(req.sizeType() == null ? "CLOTHING" : req.sizeType());
        if (req.variants() != null) {
            p.getVariants().clear();
            for (VariantRequest v : req.variants()) {
                p.getVariants().add(ProductVariant.builder().product(p).name(v.name()).imageUrl(v.imageUrl()).build());
            }
        }

        if (req.categoryId() != null) {
            Categories c = categoryRepository.findById(req.categoryId())
                    .orElseThrow(() -> ApiException.notFound("Category not found"));
            p.setCategory(c);
        }

        attachImages(p, req.images());
        return toDto(productRepository.save(p));
    }

    @Transactional
    public ProductDto update(UUID id, ProductRequest req) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Product not found"));

        // Capture old images
        List<String> oldImages = p.getImages().stream()
                .map(ProductImage::getImageUrl)
                .toList();

        p.setName(req.name());
        if (req.slug() != null && !req.slug().isBlank()) p.setSlug(CategoryService.slugify(req.slug()));
        p.setDescription(req.description());
        p.setPrice(req.price());
        p.setDiscountPercent(req.discountPercent() == null ? 0 : req.discountPercent());
        p.setStockQuantity(req.stockQuantity());
        p.setBrand(req.brand());
        p.setFeatured(req.featured());
        p.setNewArrival(req.newArrival());
        if (req.active() != null) p.setActive(req.active());

        p.setSizeType(req.sizeType() == null ? "CLOTHING" : req.sizeType());
        if (req.variants() != null) {
            p.getVariants().clear();
            for (VariantRequest v : req.variants()) {
                p.getVariants().add(ProductVariant.builder().product(p).name(v.name()).imageUrl(v.imageUrl()).build());
            }
        }

        if (req.categoryId() != null) {
            Categories c = categoryRepository.findById(req.categoryId())
                    .orElseThrow(() -> ApiException.notFound("Category not found"));
            p.setCategory(c);
        } else {
            p.setCategory(null);
        }

        p.getImages().clear();
        attachImages(p, req.images());
        Product saved = productRepository.save(p);

        // Determine which images were removed during the update
        List<String> newImages = req.images() != null ? req.images() : List.of();
        List<String> imagesToDelete = oldImages.stream()
                .filter(img -> !newImages.contains(img))
                .toList();

        registerFileDeletionAfterCommit(imagesToDelete);

        return toDto(saved);
    }

    @Transactional
    public void delete(UUID id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Product not found"));

        cartItemRepository.deleteByProductId(id);
        orderItemRepository.nullifyProductReference(id);

        List<String> imageUrls = p.getImages().stream()
                .map(ProductImage::getImageUrl)
                .toList();

        productRepository.delete(p);
        registerFileDeletionAfterCommit(imageUrls);
    }

    private void registerFileDeletionAfterCommit(List<String> fileUrls) {
        if (fileUrls == null || fileUrls.isEmpty()) return;

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    fileStorageService.deleteFiles(fileUrls);
                }
            });
        } else {
            // Fallback (shouldn't happen inside @Transactional, but safe)
            fileStorageService.deleteFiles(fileUrls);
        }
    }

    @Transactional
    public ProductDto updatePrice(UUID id, BigDecimal price) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Product not found"));
        p.setPrice(price);
        return toDto(productRepository.save(p));
    }

    @Transactional
    public ProductDto updateDiscount(UUID id, Integer discountPercent) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Product not found"));
        p.setDiscountPercent(discountPercent);
        return toDto(productRepository.save(p));
    }

    @Transactional
    public ProductDto updateStock(UUID id, Integer stock) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Product not found"));
        p.setStockQuantity(stock);
        return toDto(productRepository.save(p));
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getRelated(UUID productId, UUID categoryId) {
        if (categoryId == null) return List.of();
        return productRepository.findTop8ByCategoryIdAndIdNotAndActiveTrue(categoryId, productId)
                .stream().map(this::toDto).toList();
    }

    /* ------------ helpers ------------ */

    private void attachImages(Product p, List<String> urls) {
        if (urls == null) return;
        int order = 0;
        for (String url : urls) {
            if (url == null || url.isBlank()) continue;
            p.getImages().add(ProductImage.builder()
                    .imageUrl(url.trim())
                    .displayOrder(order++)
                    .product(p)
                    .build());
        }
    }

    public ProductDto toDto(Product p) {
        List<String> images = new ArrayList<>();
        if (p.getImages() != null) {
            p.getImages().forEach(img -> images.add(img.getImageUrl()));
        }
        List<VariantDto> variants = p.getVariants().stream()
                .map(v -> new VariantDto(v.getId(), v.getName(), v.getImageUrl())).toList();
        return new ProductDto(
                p.getId(), p.getName(), p.getSlug(), p.getDescription(),
                p.getPrice(), p.getDiscountPercent(), p.getFinalPrice(),
                p.getStockQuantity(), p.getBrand(),
                p.isFeatured(), p.isNewArrival(), p.isActive(),
                p.getCategory() != null ? p.getCategory().getId() : null,
                p.getCategory() != null ? p.getCategory().getName() : null,
                images, p.getCreatedAt(), p.getSizeType(), variants
        );
    }
}
