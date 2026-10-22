package online.shop.Controller;

import lombok.RequiredArgsConstructor;
import online.shop.Entity.Role;
import online.shop.Entity.SiteSettings;
import online.shop.Entity.User;
import online.shop.Repositories.UserRepository;
import online.shop.Services.SiteSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/site")
@RequiredArgsConstructor
public class SiteController {
    private final SiteSettingsService service;
    private final UserRepository userRepository;

    @GetMapping("/footer")
    public ResponseEntity<Map<String, Object>> footer() {
        SiteSettings s = service.get();
        Map<String, Object> body = new HashMap<>();
        body.put("brandName",         s.getBrandName());
        body.put("tagline",           s.getTagline());
        body.put("copyrightText",     s.getCopyrightText());
        body.put("shopLinks",         service.parse(s.getShopLinksJson()));
        body.put("accountLinks",      service.parse(s.getAccountLinksJson()));
        body.put("clientCareLinks",   service.parse(s.getClientCareLinksJson()));
        body.put("socialLinks",       service.parse(s.getSocialLinksJson()));
        body.put("aboutUsTitle",      s.getAboutUsTitle());
        body.put("aboutUsContent",    s.getAboutUsContent());
        body.put("aboutUsEnabled",    s.isAboutUsEnabled());
        body.put("contactEmail", s.getContactEmail());
        body.put("contactPhone", s.getContactPhone());
        body.put("contactAddress", s.getContactAddress());
        body.put("shippingPolicyContent", s.getShippingPolicyContent());
        return ResponseEntity.ok(body);
    }

    @GetMapping("/store-info")
    public ResponseEntity<Map<String, Object>> storeInfo() {
        SiteSettings s = service.get();
        User admin = userRepository.findFirstByRole(Role.ROLE_ADMIN).orElse(null);

        Map<String, Object> body = new HashMap<>();
        body.put("adminCountry", admin != null && admin.getCountry() != null ? admin.getCountry() : "BD");
        body.put("adminCity", admin != null && admin.getCity() != null ? admin.getCity() : "Dhaka");

        // Safe Fallbacks so the frontend doesn't receive nulls
        body.put("localRate", s.getLocalDeliveryCharge() != null ? s.getLocalDeliveryCharge() : new BigDecimal("60"));
        body.put("domesticRate", s.getDomesticDeliveryCharge() != null ? s.getDomesticDeliveryCharge() : new BigDecimal("120"));
        body.put("internationalRate", s.getInternationalDeliveryCharge() != null ? s.getInternationalDeliveryCharge() : new BigDecimal("3500"));

        return ResponseEntity.ok(body);
    }
}
