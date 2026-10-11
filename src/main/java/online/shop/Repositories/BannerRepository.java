package online.shop.Repositories;

import online.shop.Entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BannerRepository extends JpaRepository<Banner, UUID> {
    List<Banner> findByActiveTrueOrderByDisplayOrderAscIdAsc();
    List<Banner> findByPositionAndActiveTrueOrderByDisplayOrderAscIdAsc(String position);
    List<Banner> findAllByOrderByDisplayOrderAscIdAsc();
    long countByPosition(String position);
}
