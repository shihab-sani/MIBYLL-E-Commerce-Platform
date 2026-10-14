package online.shop.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import online.shop.DTOs.AdminUserDtos.*;
import online.shop.DTOs.AuditLogDtos.*;
import online.shop.Services.AdminUserService;
import online.shop.Services.AuditService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminUserController {
    private final AdminUserService adminUserService;
    private final AuditService auditService;

    /* ---------------- SUB-ADMINS (admin only) ---------------- */

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SubAdminDto>> listSubAdmins() {
        return ResponseEntity.ok(adminUserService.listSubAdmins());
    }

    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SubAdminDto> createSubAdmin(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody CreateSubAdminRequest req) {

        SubAdminDto created = adminUserService.createSubAdmin(req);
        auditService.log(ud.getUsername(), "ROLE_ADMIN",
                "SUBADMIN_CREATED", "USER", String.valueOf(created.id()),
                "Created sub-admin " + created.email());
        return ResponseEntity.ok(created);
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSubAdmin(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable UUID id) {

        adminUserService.deleteSubAdmin(id, ud.getUsername());
        auditService.log(ud.getUsername(), "ROLE_ADMIN",
                "SUBADMIN_DELETED", "USER", String.valueOf(id), null);
        return ResponseEntity.noContent().build();
    }

    /* ---------------- AUDIT LOG (admin only) ---------------- */

    @GetMapping("/audit")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AuditLogDto>> auditLog(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(auditService.list(page, size));
    }
}
