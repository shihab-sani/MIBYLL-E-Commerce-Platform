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

    public List<CategoryDto> getAll() {
        return categoryRepository.findAllByOrderByDisplayOrderAsc().stream()
                .filter(c -> c.getParent() == null)
                .map(this::toDto)
                .toList();
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

        Categories parent;
        if (req.parentId() != null) {
            parent = categoryRepository.findById(req.parentId()).orElse(null);
        } else {
            parent = null;
        }

        // Calculate next displayOrder
        Integer maxOrder = categoryRepository.findAll().stream()
                .filter(c -> {
                    if (parent == null) return c.getParent() == null;
                    return c.getParent() != null && c.getParent().getId().equals(parent.getId());
                })
                .map(Categories::getDisplayOrder)
                .filter(java.util.Objects::nonNull)
                .max(Integer::compare).orElse(-1);

        Categories c = Categories.builder()
                .name(req.name())
                .slug(req.slug() != null && !req.slug().isBlank() ? slugify(req.slug()) : slugify(req.name()))
                .description(req.description())
                .imageUrl(req.imageUrl())
                .parent(parent)
                .displayOrder(maxOrder + 1) // Assign next position
                .build();
        return toDto(categoryRepository.save(c));
    }

    @Transactional
    public CategoryDto update(UUID id, CategoryRequest req) {
        Categories c = categoryRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Category not found"));

        Categories parent = null;
        if (req.parentId() != null) {
            parent = categoryRepository.findById(req.parentId()).orElse(null);
        }

        String oldImageUrl = c.getImageUrl();

        c.setName(req.name());
        c.setSlug(req.slug() != null && !req.slug().isBlank() ? slugify(req.slug()) : slugify(req.name()));
        c.setDescription(req.description());
        c.setImageUrl(req.imageUrl());
        c.setParent(parent);

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
    public void move(UUID id, int direction) {
        Categories current = categoryRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Category not found"));

        List<Categories> siblings;
        if (current.getParent() == null) {
            siblings = categoryRepository.findAllByOrderByDisplayOrderAsc().stream()
                    .filter(c -> c.getParent() == null).toList();
        } else {
            siblings = categoryRepository.findAllByOrderByDisplayOrderAsc().stream()
                    .filter(c -> c.getParent() != null && c.getParent().getId().equals(current.getParent().getId())).toList();
        }

        // Sort by displayOrder, then by name just in case
        siblings = new java.util.ArrayList<>(siblings);
        siblings.sort(java.util.Comparator.comparing(Categories::getDisplayOrder, java.util.Comparator.nullsLast(java.util.Comparator.naturalOrder()))
                .thenComparing(Categories::getName));

        int currentIndex = -1;
        for (int i = 0; i < siblings.size(); i++) {
            if (siblings.get(i).getId().equals(id)) {
                currentIndex = i;
                break;
            }
        }

        if (currentIndex == -1) return;

        int targetIndex = currentIndex + direction;
        if (targetIndex < 0 || targetIndex >= siblings.size()) return;

        Categories target = siblings.get(targetIndex);

        // Handle nulls safely
        Integer currentOrder = current.getDisplayOrder() != null ? current.getDisplayOrder() : currentIndex;
        Integer targetOrder = target.getDisplayOrder() != null ? target.getDisplayOrder() : targetIndex;

        // Swap orders. If they are the same (legacy data), force a swap based on index.
        if (currentOrder.equals(targetOrder)) {
            current.setDisplayOrder(targetIndex);
            target.setDisplayOrder(currentIndex);
        } else {
            current.setDisplayOrder(targetOrder);
            target.setDisplayOrder(currentOrder);
        }

        categoryRepository.save(current);
        categoryRepository.save(target);
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
        List<CategoryDto> subs = c.getSubcategories() != null
                ? c.getSubcategories().stream().map(this::toDto).toList()
                : List.of();

        return new CategoryDto(
                c.getId(), c.getName(), c.getSlug(), c.getDescription(), c.getImageUrl(), subs
        );
    }

}
