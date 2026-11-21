package online.shop.Repositories;

import online.shop.Entity.Coffer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CofferRepository extends JpaRepository<Coffer, UUID> {
    List<Coffer> findAllByOrderByIdAsc();
}
