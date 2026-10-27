package online.shop.Config;

import lombok.RequiredArgsConstructor;
import online.shop.DTOs.BannerDtos.*;
import online.shop.DTOs.ProductDtos;
import online.shop.Entity.Banner;
import online.shop.Entity.Categories;
import online.shop.Entity.Role;
import online.shop.Entity.User;
import online.shop.Repositories.BannerRepository;
import online.shop.Repositories.CategoryRepository;
import online.shop.Repositories.ProductRepository;
import online.shop.Repositories.UserRepository;
import online.shop.Services.BannerService;
import online.shop.Services.ProductService;
import org.jspecify.annotations.NonNull;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProductService productService;
    private final BannerRepository bannerRepository;
    private final BannerService bannerService;

    @Override
    public void run(@NonNull String... args) {

        /* ---------- USERS ---------- */
        if (userRepository.count() == 0) {
            userRepository.save(User.builder()
                    .fullName("Site Admin")
                    .email("admin@shop.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ROLE_ADMIN)
                    .build());

            userRepository.save(User.builder()
                    .fullName("John Customer")
                    .email("customer@shop.com")
                    .password(passwordEncoder.encode("customer123"))
                    .role(Role.ROLE_CUSTOMER)
                    .phone("+8801700000000")
                    .address("House 12, Road 5, Dhaka")
                    .build());

            System.out.println(">> Seeded users: admin@shop.com / admin123 , customer@shop.com / customer123");
        }

        /* ---------- CATEGORIES ---------- */
        if (categoryRepository.count() == 0) {
            // 1. Main Categories with real images and display order
            Categories women = categoryRepository.save(Categories.builder().name("Women").slug("women").displayOrder(0).imageUrl("https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200").build());
            Categories men = categoryRepository.save(Categories.builder().name("Men").slug("men").displayOrder(1).imageUrl("https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1200").build());
            Categories accessories = categoryRepository.save(Categories.builder().name("Accessories").slug("accessories").displayOrder(2).imageUrl("https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1200").build());
            Categories footwear = categoryRepository.save(Categories.builder().name("Footwear").slug("footwear").displayOrder(3).imageUrl("https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200").build());

            // 2. Subcategories with display order
            categoryRepository.saveAll(List.of(
                    Categories.builder().name("Dresses").slug("dresses").parent(women).displayOrder(0).build(),
                    Categories.builder().name("Tops").slug("tops").parent(women).displayOrder(1).build(),
                    Categories.builder().name("Knitwear").slug("knitwear").parent(women).displayOrder(2).build(),

                    Categories.builder().name("Shirts").slug("shirts").parent(men).displayOrder(0).build(),
                    Categories.builder().name("Trousers").slug("trousers").parent(men).displayOrder(1).build(),
                    Categories.builder().name("Suits").slug("suits").parent(men).displayOrder(2).build(),

                    Categories.builder().name("Jewelry").slug("jewelry").parent(accessories).displayOrder(0).build(),
                    Categories.builder().name("Watches").slug("watches").parent(accessories).displayOrder(1).build(),
                    Categories.builder().name("Bags").slug("bags").parent(accessories).displayOrder(2).build(),

                    Categories.builder().name("Boots").slug("boots").parent(footwear).displayOrder(0).build(),
                    Categories.builder().name("Sneakers").slug("sneakers").parent(footwear).displayOrder(1).build(),
                    Categories.builder().name("Heels").slug("heels").parent(footwear).displayOrder(2).build()
            ));
            System.out.println(">> Seeded main & sub categories.");
        }

        /* ---------- PRODUCTS ---------- */
        if (productRepository.count() == 0) {
            UUID women = categoryRepository.findBySlug("women").orElseThrow().getId();
            UUID men   = categoryRepository.findBySlug("men").orElseThrow().getId();
            UUID acc   = categoryRepository.findBySlug("accessories").orElseThrow().getId();
            UUID foot  = categoryRepository.findBySlug("footwear").orElseThrow().getId();

            seed("Silk Embroidered Saree", new BigDecimal("450.00"), 15, 20, "Sabyasachi", women,
                    "Hand-embroidered silk saree with intricate zardosi work. A timeless heirloom piece.",
                    List.of("https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200",
                            "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200"));

            seed("Oversized Wool Coat", new BigDecimal("289.00"), 20, 35, "ZARA", women,
                    "Relaxed-fit wool blend coat with dropped shoulders and a belted waist.",
                    List.of("https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=1200",
                            "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200"));

            seed("Tailored Linen Blazer", new BigDecimal("199.00"), 0, 40, "Dolce & Gabbana", men,
                    "Single-breasted linen blazer with peak lapels and a structured shoulder.",
                    List.of("https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200"));

            seed("Minimal Leather Tote", new BigDecimal("320.00"), 25, 15, "Atelier", acc,
                    "Full-grain Italian leather tote, unlined with hand-painted edges.",
                    List.of("https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200",
                            "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=1200"));

            seed("Sculpted Heel Sandal", new BigDecimal("175.00"), 10, 25, "Studio", foot,
                    "Architectural heel sandal in soft nappa leather.",
                    List.of("https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1200"));

            seed("Cashmere Crewneck", new BigDecimal("240.00"), 30, 50, "Maison", men,
                    "Grade-A Mongolian cashmere crewneck, garment-dyed for depth of colour.",
                    List.of("https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200"));

            seed("Pleated Midi Skirt", new BigDecimal("129.00"), 0, 60, "Atelier", women,
                    "Knife-pleated midi skirt with a satin finish and elasticated waist.",
                    List.of("https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=1200"));

            seed("Gold Vermeil Cuff", new BigDecimal("98.00"), 0, 80, "Studio", acc,
                    "18k gold vermeil cuff, hand-hammered for a soft organic texture.",
                    List.of("https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200"));

            seed("Structured Shoulder Bag", new BigDecimal("410.00"), 12, 18, "Dolce & Gabbana", acc,
                    "Compact structured shoulder bag in polished calfskin with a chain strap.",
                    List.of("https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200"));

            seed("Leather Chelsea Boot", new BigDecimal("265.00"), 18, 30, "ZARA", foot,
                    "Classic Chelsea boot in burnished leather with an elasticated side panel.",
                    List.of("https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=1200"));

            System.out.println(">> Seeded demo categories & products.");
        }

        /* =================================================================
           BANNERS
           ================================================================= */

        /* ---------- 1. MIGRATION: NULL / blank position → TOP ---------- */
        int migrated = 0;
        for (Banner b : bannerRepository.findAll()) {
            if (b.getPosition() == null || b.getPosition().isBlank()) {
                b.setPosition("TOP");
                bannerRepository.save(b);
                migrated++;
            }
        }
        if (migrated > 0) {
            System.out.println(">> Migrated " + migrated + " legacy banner(s) to position=TOP");
        }

        /* ---------- 2. SEED TOP (HERO) BANNER ---------- */
        if (bannerRepository.countByPosition("TOP") == 0) {
            bannerService.create(new BannerRequest(
                    "The Art of\nQuiet Luxury",
                    "Autumn / Winter Collection",
                    "EXPLORE THE COLLECTION",
                    "/shop",
                    "TOP", null, 0, true,
                    List.of(new BannerMediaRequest("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=2000", "IMAGE"))
            ));
            System.out.println(">> Seeded 1 TOP banner.");
        }

        /* ---------- 3. SEED EDITORIAL BANNERS ---------- */
        if (bannerRepository.countByPosition("EDITORIAL") == 0) {
            bannerService.create(new BannerRequest(
                    "Crafted Slowly",
                    "New Season",
                    "SHOP NEW ARRIVALS",
                    "/shop?sort=newest",
                    "EDITORIAL", null, 0, true,
                    List.of(new BannerMediaRequest("https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200", "IMAGE"))
            ));
            bannerService.create(new BannerRequest(
                    "Timeless Pieces",
                    "For Every Day",
                    "DISCOVER",
                    "/shop",
                    "EDITORIAL", null, 1, true,
                    List.of(new BannerMediaRequest("https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1200", "IMAGE"))
            ));
            bannerService.create(new BannerRequest(
                    "Our Craftsmanship",
                    "Quality Materials",
                    "EXPLORE",
                    "/shop",
                    "EDITORIAL", null, 2, true,
                    List.of(new BannerMediaRequest("https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200", "IMAGE"))
            ));
            System.out.println(">> Seeded 3 EDITORIAL banners.");
        }
    }

    private void seed(String name, BigDecimal price, int discount, int stock, String brand,
                      UUID categoryId, String description, List<String> images) {
        productService.create(new ProductDtos.ProductRequest(
                name,
                null,
                description,
                price,
                discount,
                stock,
                brand,
                true,       // active
                categoryId,
                images,
                "CLOTHING",
                List.of(),
                false       // <-- FIXED: added the missing 'featured' boolean
        ));
    }
}
