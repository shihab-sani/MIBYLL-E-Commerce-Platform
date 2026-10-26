package online.shop.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "banner_media")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BannerMedia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "banner_id", nullable = false)
    private Banner banner;

    @Column(nullable = false, length = 1000)
    private String mediaUrl;

    @Column(nullable = false)
    private String mediaType; // "IMAGE" or "VIDEO"

    @Builder.Default
    private Integer displayOrder = 0;
}
