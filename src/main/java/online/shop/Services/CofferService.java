package online.shop.Services;

import lombok.RequiredArgsConstructor;
import online.shop.DTOs.CofferDtos.*;
import online.shop.Entity.Coffer;
import online.shop.ExceptionsHandler.ApiException;
import online.shop.Repositories.CofferRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CofferService {
    private final CofferRepository repository;
    private final FileStorageService fileStorageService;

    public List<CofferDto> getAll() {
        return repository.findAllByOrderByIdAsc().stream().map(this::toDto).toList();
    }

    @Transactional
    public CofferDto create(CofferRequest req) {
        Coffer c = Coffer.builder()
                .year(req.year())
                .title(req.title())
                .description(req.description())
                .imageUrl(req.imageUrl())
                .displayOrder(req.displayOrder() == null ? 0 : req.displayOrder())
                .build();
        return toDto(repository.save(c));
    }

    @Transactional
    public CofferDto update(UUID id, CofferRequest req) {
        Coffer c = repository.findById(id).orElseThrow(() -> ApiException.notFound("Entry not found"));
        String oldImage = c.getImageUrl();

        c.setYear(req.year());
        c.setTitle(req.title());
        c.setDescription(req.description());
        c.setImageUrl(req.imageUrl());
        if (req.displayOrder() != null) c.setDisplayOrder(req.displayOrder());

        Coffer saved = repository.save(c);

        if (oldImage != null && !oldImage.equals(req.imageUrl())) {
            registerFileDeletion(oldImage);
        }
        return toDto(saved);
    }

    @Transactional
    public void delete(UUID id) {
        Coffer c = repository.findById(id).orElseThrow(() -> ApiException.notFound("Entry not found"));
        repository.delete(c);
        if (c.getImageUrl() != null) registerFileDeletion(c.getImageUrl());
    }

    private void registerFileDeletion(String url) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() { fileStorageService.deleteFile(url); }
            });
        } else {
            fileStorageService.deleteFile(url);
        }
    }

    private CofferDto toDto(Coffer c) {
        return new CofferDto(c.getId(), c.getYear(), c.getTitle(), c.getDescription(), c.getImageUrl(), c.getDisplayOrder());
    }
}
