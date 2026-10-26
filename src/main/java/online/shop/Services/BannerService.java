package online.shop.Services;

import lombok.RequiredArgsConstructor;
import online.shop.DTOs.BannerDtos.*;
import online.shop.Entity.Banner;
import online.shop.Entity.BannerMedia;
import online.shop.Entity.Product;
import online.shop.ExceptionsHandler.ApiException;
import online.shop.Repositories.BannerRepository;
import online.shop.Repositories.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BannerService {
    private final BannerRepository bannerRepository;
    private final ProductRepository productRepository;
    private final FileStorageService fileStorageService;

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
                .position(req.position() == null ? "TOP" : req.position().toUpperCase())
                .linkedProductId(req.linkedProductId())
                .displayOrder(req.displayOrder() == null ? 0 : req.displayOrder())
                .active(req.active() == null || req.active())
                .build();

        attachMedia(b, req.mediaList());
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
        if (req.position() != null) b.setPosition(req.position().toUpperCase());
        b.setLinkedProductId(req.linkedProductId());
        if (req.displayOrder() != null) b.setDisplayOrder(req.displayOrder());
        if (req.active() != null) b.setActive(req.active());

        b.getMediaList().clear();
        attachMedia(b, req.mediaList());

        return toDto(bannerRepository.save(b));
    }

    @Transactional
    public void delete(UUID id) {
        Banner b = bannerRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Banner not found"));

        List<String> mediaUrls = b.getMediaList() == null ? List.of() : b.getMediaList().stream()
                .map(BannerMedia::getMediaUrl)
                .filter(mediaUrl -> mediaUrl != null && !mediaUrl.isBlank())
                .toList();

        bannerRepository.delete(b);

        if (!mediaUrls.isEmpty()) {
            if (TransactionSynchronizationManager.isSynchronizationActive()) {
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        mediaUrls.forEach(fileStorageService::deleteFile);
                    }
                });
            } else {
                mediaUrls.forEach(fileStorageService::deleteFile);
            }
        }
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

    private void attachMedia(Banner b, java.util.List<BannerMediaRequest> mediaList) {
        if (mediaList == null) return;
        int order = 0;
        for (BannerMediaRequest m : mediaList) {
            if (m.mediaUrl() == null || m.mediaUrl().isBlank()) continue;
            b.getMediaList().add(BannerMedia.builder()
                    .banner(b)
                    .mediaUrl(m.mediaUrl())
                    .mediaType(m.mediaType() == null ? "IMAGE" : m.mediaType())
                    .displayOrder(order++)
                    .build());
        }
    }

    public BannerDto toDto(Banner b) {
        String slug = null;
        if (b.getLinkedProductId() != null) {
            slug = productRepository.findById(b.getLinkedProductId())
                    .map(Product::getSlug).orElse(null);
        }

        java.util.List<BannerMediaDto> mediaDtos = b.getMediaList().stream()
                .map(m -> new BannerMediaDto(m.getId(), m.getMediaUrl(), m.getMediaType(), m.getDisplayOrder()))
                .toList();

        return new BannerDto(
                b.getId(), b.getTitle(), b.getSubtitle(), b.getCtaText(), b.getCtaLink(),
                b.getPosition() == null ? "TOP" : b.getPosition(), b.getLinkedProductId(), slug,
                b.getDisplayOrder(), b.isActive(), b.getCreatedAt(), mediaDtos
        );
    }
}
