package online.shop.Repositories;

import online.shop.Entity.SiteSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SiteSettingsRepository extends JpaRepository<SiteSettings, Long> {
}
