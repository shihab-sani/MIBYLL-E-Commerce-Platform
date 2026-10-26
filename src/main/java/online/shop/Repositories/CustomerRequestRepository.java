package online.shop.Repositories;

import online.shop.Entity.CustomerRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CustomerRequestRepository extends JpaRepository<CustomerRequest, UUID> {
    List<CustomerRequest> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<CustomerRequest> findAllByOrderByCreatedAtDesc();
}
