package online.shop.Repositories;

import online.shop.Entity.Categories;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Categories, UUID> {
    Optional<Categories> findBySlug(String slug);
    boolean existsByName(String name);
    List<Categories> findAllByOrderByDisplayOrderAsc();
}
