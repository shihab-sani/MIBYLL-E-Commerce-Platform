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
                    .shippingPolicyContent("Complimentary shipping on all orders over $200." +
                            "\n\nFree returns within 30 days of delivery. Items must be unworn and in their original packaging with tags attached.")
                    .socialLinksJson("[{\"platform\":\"facebook\",\"url\":\"https://facebook.com\"}," +
                            "{\"platform\":\"instagram\",\"url\":\"https://instagram.com\"}," +
                            "{\"platform\":\"twitter\",\"url\":\"https://x.com\"}," +
                            "{\"platform\":\"pinterest\",\"url\":\"https://pinterest.com\"}," +
                            "{\"platform\":\"linkedin\",\"url\":\"https://linkedin.com\"}," +
                            "{\"platform\":\"youtube\",\"url\":\"https://youtube.com\"}]")
                    .aboutUsTitle("About Us")
                    .aboutUsContent("Mibyll is a considered edit of contemporary craft. " +
                            "Every piece is made in limited quantities by artisans who have " +
                            "honed their craft over generations.\n\n" +
                            "We believe in slow fashion: fewer, better things, made to be " +
                            "worn, kept, and passed on. Our materials are chosen for how they " +
                            "age, not just how they look on the first day.\n\n" +
                            "Questions? Write to us at hello@mibyll.com.")
                    .aboutUsEnabled(true)
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
        current.setSocialLinksJson(incoming.getSocialLinksJson());
        current.setAboutUsTitle(incoming.getAboutUsTitle());
        current.setAboutUsContent(incoming.getAboutUsContent());
        current.setAboutUsEnabled(incoming.isAboutUsEnabled());
        current.setContactEmail(incoming.getContactEmail());
        current.setContactPhone(incoming.getContactPhone());
        current.setContactAddress(incoming.getContactAddress());
        current.setShippingPolicyContent(incoming.getShippingPolicyContent());
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
