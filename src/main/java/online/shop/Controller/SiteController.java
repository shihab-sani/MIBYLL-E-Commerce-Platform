package online.shop.Controller;

import lombok.RequiredArgsConstructor;
import online.shop.Entity.SiteSettings;
import online.shop.Services.SiteSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/site")
@RequiredArgsConstructor
public class SiteController {
    private final SiteSettingsService service;

    @GetMapping("/footer")
    public ResponseEntity<Map<String, Object>> footer() {
        SiteSettings s = service.get();
        Map<String, Object> body = new HashMap<>();
        body.put("brandName", s.getBrandName());
        body.put("tagline", s.getTagline());
        body.put("copyrightText", s.getCopyrightText());
        body.put("shopLinks", service.parse(s.getShopLinksJson()));
        body.put("accountLinks", service.parse(s.getAccountLinksJson()));
        body.put("clientCareLinks", service.parse(s.getClientCareLinksJson()));
        return ResponseEntity.ok(body);
    }
}
