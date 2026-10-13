package online.shop.Services;

import lombok.RequiredArgsConstructor;
import online.shop.DTOs.BannerDtos.*;
import online.shop.Entity.Banner;
import online.shop.Entity.Product;
import online.shop.ExceptionsHandler.ApiException;
import online.shop.Repositories.BannerRepository;
import online.shop.Repositories.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BannerService {
    private final BannerRepository bannerRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<BannerDto> getActive(String position) {
        if (position == null || position.isBlank()) {
            return bannerRepository.findByActiveTrueOrderByDisplayOrderAscIdAsc()
                    .stream().map(this::toDto).toList();
        }
        return bannerRepository.findByPositionAndActiveTrueOrderByDisplayOrderAscIdAsc(position.toUpperCase())
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<BannerDto> getAll() {
        return bannerRepository.findAllByOrderByDisplayOrderAscIdAsc()
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public BannerDto create(BannerRequest req) {
        Banner b = Banner.builder()
                .title(req.title())
                .subtitle(req.subtitle())
                .ctaText(req.ctaText())
                .ctaLink(req.ctaLink())
                .mediaUrl(req.mediaUrl())
                .mediaType(req.mediaType() == null ? "IMAGE" : req.mediaType())
                .position(req.position() == null ? "TOP" : req.position().toUpperCase())
                .linkedProductId(req.linkedProductId())
                .displayOrder(req.displayOrder() == null ? 0 : req.displayOrder())
                .active(req.active() == null || req.active())
                .build();
        return toDto(bannerRepository.save(b));
    }

    @Transactional
    public BannerDto update(UUID id, BannerRequest req) {
        Banner b = bannerRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Banner not found"));

        b.setTitle(req.title());
        b.setSubtitle(req.subtitle());
        b.setCtaText(req.ctaText());
        b.setCtaLink(req.ctaLink());
        b.setMediaUrl(req.mediaUrl());
        b.setMediaType(req.mediaType() == null ? "IMAGE" : req.mediaType());
        if (req.position() != null) b.setPosition(req.position().toUpperCase());
        b.setLinkedProductId(req.linkedProductId());
        if (req.displayOrder() != null) b.setDisplayOrder(req.displayOrder());
        if (req.active() != null) b.setActive(req.active());

        return toDto(bannerRepository.save(b));
    }

    @Transactional
    public void delete(UUID id) {
        if (!bannerRepository.existsById(id)) {
            throw ApiException.notFound("Banner not found");
        }
        bannerRepository.deleteById(id);
    }

    @Transactional
    public BannerDto move(UUID id, int direction) {
        Banner b = bannerRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Banner not found"));

        int newOrder = b.getDisplayOrder() == null ? 0 : b.getDisplayOrder() + direction;
        if (newOrder < 0) newOrder = 0;
        b.setDisplayOrder(newOrder);
        return toDto(bannerRepository.save(b));
    }

    public BannerDto toDto(Banner b) {
        String slug = null;
        if (b.getLinkedProductId() != null) {
            slug = productRepository.findById(b.getLinkedProductId())
                    .map(Product::getSlug).orElse(null);
        }

        return new BannerDto(
                b.getId(),
                b.getTitle(),
                b.getSubtitle(),
                b.getCtaText(),
                b.getCtaLink(),
                b.getMediaUrl(),
                b.getMediaType(),
                b.getPosition() == null ? "TOP" : b.getPosition(),
                b.getLinkedProductId(),
                slug,
                b.getDisplayOrder(),
                b.isActive(),
                b.getCreatedAt()
        );
    }
}
