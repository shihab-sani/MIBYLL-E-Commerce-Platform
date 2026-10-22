package online.shop.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "site_settings")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SiteSettings {
    @Id
    private Long id;    // always 1

    @Column(nullable = false)
    @Builder.Default
    private String brandName = "Mibyll";

    @Column(length = 500)
    @Builder.Default
    private String tagline = "A considered edit of contemporary craft. Made to be worn, kept and passed on.";

    @Column(length = 500)
    @Builder.Default
    private String copyrightText = "";

    /** JSON array of {label, href} for the "Shop" column */
    @Column(columnDefinition = "TEXT")
    @Builder.Default
    private String shopLinksJson = "[]";

    /** JSON array of {label, href} for the "Account" column */
    @Column(columnDefinition = "TEXT")
    @Builder.Default
    private String accountLinksJson = "[]";

    /** JSON array of {label, href} for the "Client Care" column */
    @Column(columnDefinition = "TEXT")
    @Builder.Default
    private String clientCareLinksJson = "[]";

    @Column(columnDefinition = "TEXT")
    @Builder.Default
    private String socialLinksJson = "[]";

    @Column(length = 200)
    @Builder.Default
    private String aboutUsTitle = "About Us";

    @Column(columnDefinition = "LONGTEXT")
    @Builder.Default
    private String aboutUsContent = "";

    @Column(nullable = false)
    @Builder.Default
    private boolean aboutUsEnabled = true;

    @Column(length = 200)
    @Builder.Default
    private String contactEmail = "hello@mibyll.com";

    @Column(length = 50)
    @Builder.Default
    private String contactPhone = "+880 1700 000000";

    @Column(length = 500)
    @Builder.Default
    private String contactAddress = "Dhaka, Bangladesh";

    @Builder.Default
    private BigDecimal localDeliveryCharge = new BigDecimal("70");

    @Builder.Default
    private BigDecimal domesticDeliveryCharge = new BigDecimal("120");

    @Builder.Default
    private BigDecimal internationalDeliveryCharge = new BigDecimal("3500");

    @Column(columnDefinition = "LONGTEXT")
    @Builder.Default
    private String shippingPolicyContent = "Complimentary shipping on all orders over $200.\n\nFree returns within 30 days of delivery. Items must be unworn and in their original packaging with tags attached.";
}
