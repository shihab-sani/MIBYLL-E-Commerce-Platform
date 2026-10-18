package online.shop.Services;

import lombok.RequiredArgsConstructor;
import online.shop.DTOs.CategoryDtos;
import online.shop.DTOs.CategoryDtos.*;
import online.shop.Entity.Categories;
import online.shop.ExceptionsHandler.ApiException;
import online.shop.Repositories.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;

    public List<CategoryDtos.CategoryDto> getAll() {
        return categoryRepository.findAll().stream().map(this::toDto).toList();
    }

    public CategoryDtos.CategoryDto getById(UUID id) {
        return toDto(categoryRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Category not found")));
    }

    @Transactional
    public CategoryDto create(CategoryRequest req) {
        if (categoryRepository.existsByName(req.name())) {
            throw ApiException.badRequest("Category name already exists");
        }
        Categories c = Categories.builder()
                .name(req.name())
                .slug(req.slug() != null && !req.slug().isBlank() ? slugify(req.slug()) : slugify(req.name()))
                .description(req.description())
                .imageUrl(req.imageUrl())
                .build();
        return toDto(categoryRepository.save(c));
    }

    @Transactional
    public CategoryDto update(UUID id, CategoryRequest req) {
        Categories c = categoryRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Category not found"));

        String oldImageUrl = c.getImageUrl();

        c.setName(req.name());
        c.setSlug(req.slug() != null && !req.slug().isBlank() ? slugify(req.slug()) : slugify(req.name()));
        c.setDescription(req.description());
        c.setImageUrl(req.imageUrl());

        CategoryDto saved = toDto(categoryRepository.save(c));

        // SAFE FILE DELETION ON UPDATE
        if (req.imageUrl() != null && !req.imageUrl().equals(oldImageUrl) && oldImageUrl != null) {
            if (TransactionSynchronizationManager.isSynchronizationActive()) {
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        fileStorageService.deleteFile(oldImageUrl);
                    }
                });
            } else {
                fileStorageService.deleteFile(oldImageUrl);
            }
        }
        return saved;
    }

    @Transactional
    public void delete(UUID id) {
        Categories c = categoryRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Category not found"));

        String imageUrl = c.getImageUrl();
        categoryRepository.delete(c);

        // SAFE FILE DELETION ON DELETE
        if (imageUrl != null) {
            if (TransactionSynchronizationManager.isSynchronizationActive()) {
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        fileStorageService.deleteFile(imageUrl);
                    }
                });
            } else {
                fileStorageService.deleteFile(imageUrl);
            }
        }
    }

    public static String slugify(String input) {
        String nowhitespace = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .toLowerCase(Locale.ROOT)
                .trim()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
        return nowhitespace.isBlank() ? "item-" + System.currentTimeMillis() : nowhitespace;
    }

    private CategoryDto toDto(Categories c) {
        return new CategoryDto(c.getId(), c.getName(), c.getSlug(), c.getDescription(), c.getImageUrl());
    }

}
