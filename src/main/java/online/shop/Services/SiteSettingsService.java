package online.shop.Services;

import lombok.RequiredArgsConstructor;
import online.shop.Entity.SiteSettings;
import online.shop.Repositories.SiteSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SiteSettingsService {
    private final SiteSettingsRepository repo;
    private final ObjectMapper objectMapper;

    @Transactional
    public SiteSettings get() {
        return repo.findById(1L).orElseGet(() -> {
            SiteSettings s = SiteSettings.builder()
                    .id(1L)
                    .brandName("Mibyll")
                    .tagline("A considered edit of contemporary craft. Made to be worn, kept and passed on.")
                    .copyrightText("© " + java.time.Year.now() + " Mibyll. All rights reserved.")
                    .shopLinksJson(sampleJson(new String[][] {
                            {"All Products", "/shop"},
                            {"Cart", "/cart"},
                    }))
                    .accountLinksJson(sampleJson(new String[][] {
                            {"My Orders", "/orders"},
                            {"Login", "/login"},
                            {"Create Account", "/register"},
                    }))
                    .clientCareLinksJson(sampleJson(new String[][] {
                            {"Shipping & Returns", "#"},
                            {"Size Guide", "#"},
                            {"Contact", "#"},
                    }))
                    .build();
            return repo.save(s);
        });
    }

    @Transactional
    public SiteSettings update(SiteSettings incoming) {
        SiteSettings current = get();
        current.setBrandName(incoming.getBrandName());
        current.setTagline(incoming.getTagline());
        current.setCopyrightText(incoming.getCopyrightText());
        current.setShopLinksJson(incoming.getShopLinksJson());
        current.setAccountLinksJson(incoming.getAccountLinksJson());
        current.setClientCareLinksJson(incoming.getClientCareLinksJson());
        return repo.save(current);
    }

    public List<Map<String, String>> parse(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    private String sampleJson(String[][] rows) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < rows.length; i++) {
            if (i > 0) sb.append(",");
            sb.append("{\"label\":\"").append(rows[i][0])
                    .append("\",\"href\":\"").append(rows[i][1]).append("\"}");
        }
        return sb.append("]").toString();
    }
}
