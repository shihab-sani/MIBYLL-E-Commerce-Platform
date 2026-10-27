package online.shop.Repositories;

import online.shop.Entity.Categories;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Categories, UUID> {
    Optional<Categories> findBySlug(String slug);
    boolean existsByName(String name);
    List<Categories> findAllByOrderByDisplayOrderAsc();

    @Query("""
        SELECT c FROM Categories c
        WHERE c.parent IS NULL
        AND NOT EXISTS (
            SELECT p FROM Product p
            JOIN p.category pc
            WHERE (pc = c OR pc.parent = c) AND p.featured = false
        )
    """)
    List<Categories> findCategoriesWithNoNormalProducts();

    @Query("""
        SELECT c FROM Categories c
        WHERE c.parent IS NULL
        AND EXISTS (
            SELECT p FROM Product p
            JOIN p.category pc
            WHERE (pc = c OR pc.parent = c) AND p.featured = false
        )
    """)
    List<Categories> findCategoriesWithNormalProducts();
}
