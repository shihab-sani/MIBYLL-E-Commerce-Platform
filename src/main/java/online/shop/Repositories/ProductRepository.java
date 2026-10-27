package online.shop.Repositories;

import online.shop.Entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {
    Optional<Product> findBySlug(String slug);
    boolean existsBySlug(String slug);


    @Query("""
        SELECT p FROM Product p
        JOIN p.category c
        LEFT JOIN c.parent parent
        WHERE p.active = true
          AND (:featured IS NULL OR p.featured = :featured)
          AND (:categorySlug IS NULL OR c.slug = :categorySlug OR parent.slug = :categorySlug)
          AND (:q IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%'))
                          OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :q, '%')))
        ORDER BY p.createdAt DESC
    """)
    Page<Product> search(@Param("categorySlug") String categorySlug,
                         @Param("q") String q,
                         @Param("featured") Boolean featured,
                         Pageable pageable);

    long countByStockQuantityLessThan(int threshold);
    List<Product> findTop8ByCategoryIdAndIdNotAndActiveTrue(UUID categoryId, UUID id);
}
